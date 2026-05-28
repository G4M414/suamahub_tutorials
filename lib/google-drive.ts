import { google } from 'googleapis';
import { Readable } from 'stream';

// Fix SSL certificate verification on Windows dev environments
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const CLIENTES_FOLDER_ID = process.env.GOOGLE_DRIVE_CLIENTES_FOLDER_ID!;

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

// Busca una subcarpeta por nombre dentro de un padre. Si no existe, la crea.
async function getOrCreateFolder(drive: ReturnType<typeof google.drive>, name: string, parentId: string): Promise<string> {
  const res = await drive.files.list({
    q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });
  return created.data.id!;
}

// Sube un archivo a Drive en la carpeta correcta del cliente y devuelve la URL pública.
// Estructura: CLIENTES/{clientName}/{subfolder}/{filename}
export async function uploadToDrive({
  buffer,
  mimeType,
  filename,
  clientName,
  subfolder, // 'Imágenes' | 'Videos'
}: {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  clientName: string;
  subfolder: 'Imágenes' | 'Videos' | 'Logo' | 'Audio';
}): Promise<string> {
  const drive = getDriveClient();

  // CLIENTES/{clientName}/
  const clientFolderId = await getOrCreateFolder(drive, clientName, CLIENTES_FOLDER_ID);
  // CLIENTES/{clientName}/{subfolder}/
  const subFolderId = await getOrCreateFolder(drive, subfolder, clientFolderId);

  // Subir archivo
  const stream = Readable.from(buffer);
  const uploaded = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [subFolderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id',
  });

  const fileId = uploaded.data.id!;

  // Hacer el archivo público (lectura)
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // URL directa que Shotstack puede consumir
  return `https://drive.google.com/uc?id=${fileId}`;
}
