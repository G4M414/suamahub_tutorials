export async function register() {
  if (process.env.NODE_ENV !== 'production') {
    // Entorno de dev detrás de un proxy corporativo con certificado MITM:
    // permitimos TLS no verificado SOLO en desarrollo, para que next/font
    // (Google Fonts) y las llamadas a APIs externas (Notion, Drive, etc.)
    // no fallen por "unable to verify the first certificate".
    //
    // Importante: NO importamos `undici` acá. Su submódulo mock importa
    // `node:console`, que webpack no sabe bundlear e ingresa un build error
    // ("UnhandledSchemeError"). Node respeta esta env var en su fetch/undici
    // global sin necesidad de importar nada.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}
