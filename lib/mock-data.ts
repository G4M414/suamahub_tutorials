import { Project } from './types';
import { SUAMA_COLORS } from './constants';

export const mockProjectTutorial01: Project = {
  id: 'demo_project_01',
  projectName: 'Capacitación General SMG - Hotelería',
  clientName: 'SUAMA Demo Client',
  companyName: '',
  industry: 'Hotel',
  tutorialId: 'tutorial_hoteles_cocina',
  identity: {
    logoUrl: '/logo-suama.jpg',
    colors: { ...SUAMA_COLORS },
    fontFamily: 'harabara',
  },
  slots: [
    {
      id: 'SLOT_01',
      title: 'Portada',
      active: true,
      fields: {
        title: 'Prevención de riesgos en hoteles (con cocina)',
        subtitle: 'Capacitación obligatoria de higiene y seguridad',
      },
    },
    {
      id: 'SLOT_02',
      title: 'Objetivos',
      active: true,
      fields: {
        objectivesText: 'Al término del curso, el participante conocerá los factores que originan la creación de riesgos y peligros para poder identificar y clasificar los mismos a fin de poder eliminarlos, minimizarlos o evitarlos.',
      },
    },
    {
      id: 'SLOT_03',
      title: 'Marco Legal',
      active: true,
      fields: {
        laws: [
          'Ley de Higiene y Seguridad 19.587 y Decreto 351/79',
          'Ley de Riesgos del Trabajo 24.557 y Decreto 170/96',
        ],
        description: 'Todo establecimiento comercial y de servicios debe adecuarse a las normas de seguridad vigentes para salvaguardar la integridad psicofísica de sus colaboradores.',
      },
    },
    {
      id: 'SLOT_03B',
      title: 'Obligaciones, Deberes y Derechos',
      active: true,
      mediaId: 'slot_03b_img',
      fields: {
        title: 'Obligaciones, Deberes y Derechos',
        trabajadoresDuties: [
          'Recibir información y capacitación sobre prevención de riesgos, debiendo participar en las acciones preventivas.',
          'Cumplir con las Normas de Higiene y Seguridad.',
          'Informar al empleador los hechos que conozcan relacionados con los riesgos del trabajo.',
          'Denunciar ante el empleador los accidentes y enfermedades profesionales.',
        ],
        empleadoresDuties: [
          'Proveer a los trabajadores de equipos de protección personal adecuados.',
          'Garantizar condiciones seguras e higiénicas en el lugar de trabajo.',
          'Capacitar al personal en materia de higiene y seguridad.',
          'Denunciar los accidentes de trabajo y enfermedades profesionales a la ART.',
        ],
      },
    },
    {
      id: 'SLOT_04',
      title: 'Definiciones Clave',
      active: true,
      fields: {
        definitions: [
          { term: 'Accidente', definition: 'Acontecimiento inesperado que produce daños a personas, propiedad, ambiente o pérdidas en el proceso.' },
          { term: 'Incidente', definition: 'Acontecimiento inesperado que podría haber producido daños pero no los produjo.' },
          { term: 'Enfermedad profesional', definition: 'Deterioro lento de la salud por exposición crónica a situaciones adversas en el entorno laboral.' },
          { term: 'Pirámide de accidentes', definition: 'Relación estadística: por cada 600 incidentes sin daño se producen 30 daños a propiedad, 10 lesiones menores y 1 lesión grave.' },
        ],
      },
    },
    {
      id: 'SLOT_05',
      title: 'Razones para la Prevención',
      active: true,
      fields: {
        moral: 'El trabajo no debe perjudicar la salud de las personas; es una obligación ética cuidar al trabajador.',
        legal: 'Es una obligación legal según la Ley 24.557 reducir la siniestralidad dentro de la empresa.',
        economic: 'Los accidentes aumentan los costos (ausentismo, reemplazos, primas de ART) y reducen las utilidades.',
        competitive: 'Un ambiente seguro mejora la productividad, la reputación de la empresa y la motivación del equipo.',
      },
    },
    {
      id: 'SLOT_06',
      title: 'Principios Clave',
      active: true,
      fields: {
        principles: [
          'Todos los accidentes son evitables con una correcta planificación.',
          'La responsabilidad principal de la seguridad recae en la gerencia y la línea de mando.',
          'Todo el personal debe recibir formación continua sobre técnicas seguras de trabajo.',
          'Los riesgos inherentes a cada proceso deben identificarse y controlarse en el origen.',
        ],
      },
    },
    {
      id: 'SLOT_07',
      title: 'Gestión y Roles',
      active: true,
      fields: {
        managementDescription: 'La gestión eficiente de la prevención combina conductas seguras, orden, limpieza y la jerarquía de controles.',
        dangerAnalysis: 'Área de exposición → Área de peligro → Área de riesgo. Identificamos los desvíos antes de que ocurran.',
        hierarchyOfControls: '1. Eliminar el riesgo | 2. Sustituir por menos peligroso | 3. Minimizar con ingeniería | 4. Reducir exposición con EPP.',
        responsibilities: [
          'Dirección: Proveer recursos y establecer políticas claras.',
          'Supervisores: Hacer cumplir las normas y reportar desvíos.',
          'Trabajadores: Utilizar los EPP y seguir los procedimientos seguros.',
        ],
      },
    },
    {
      id: 'SLOT_08',
      title: 'Módulos de Riesgo',
      active: true,
      fields: {},
      riskModules: [
        {
          id: '08a',
          name: 'Resbalones y caídas',
          active: true,
          causes: [
            'Superficies mojadas o resbaladizas',
            'Cambios bruscos de superficie sin señalizar',
            'Falta de iluminación en zonas de paso',
            'Desorden y obstáculos en el piso',
            'Cables sueltos cruzando pasillos',
            'Alfombras despegadas o rotas',
            'Uso inadecuado de escaleras o banquetas',
          ],
          measures: [
            'Utilizar calzado con suela antideslizante',
            'Colocar carteles de aviso de piso mojado durante la limpieza',
            'Limpiar inmediatamente cualquier derrame',
            'Mantener una iluminación adecuada en todas las áreas',
            'Garantizar el orden y retirar obstáculos de los pasillos',
            'Fijar o cubrir cables expuestos',
          ],
          mediaId: 'media_08a',
        },
        {
          id: '08b',
          name: 'Cortes y atrapamientos',
          active: true,
          causes: [
            'Uso de máquinas sin protección (picadoras, cortadoras de fiambre)',
            'Falta de concentración en tareas repetitivas',
            'Manipulación incorrecta de cuchillos y utensilios cortantes',
            'Falta de mantenimiento de herramientas de corte',
          ],
          measures: [
            'Verificar el funcionamiento de los resguardos y paradas de emergencia',
            'Utilizar los elementos de protección personal (EPP) como guantes de malla',
            'Respetar estrictamente los procedimientos de limpieza de máquinas',
            'Mantener los cuchillos afilados (un cuchillo desafilado requiere más fuerza y resbala más)',
          ],
          mediaId: 'media_08b',
        },
        {
          id: '08c',
          name: 'Quemaduras',
          active: true,
          causes: [
            'Contacto accidental con superficies calientes (planchas, hornos, freidoras)',
            'Salpicaduras de líquidos calientes (aceite hirviendo, agua)',
            'Exposición a vapores de cocción',
            'Traslado de recipientes calientes sin protección',
          ],
          measures: [
            'Utilizar manoplas y guantes térmicos homologados',
            'Evitar llenar recipientes con líquidos calientes hasta el borde',
            'Orientar los mangos de sartenes y ollas hacia el interior de la cocina',
            'Abrir las tapas de ollas y hornos en dirección opuesta al rostro para desviar el vapor',
          ],
          mediaId: 'media_08c',
        },
        {
          id: '08d',
          name: 'Riesgo eléctrico',
          active: true,
          causes: [
            'Sobrecarga de tomas corrientes con adaptadores múltiples',
            'Uso de cables pelados o enchufes dañados',
            'Equipos eléctricos con fallas de aislamiento',
            'Manipulación de tableros o enchufes con manos o pies mojados',
          ],
          measures: [
            'Revisión periódica de tableros y cableados por electricistas matriculados',
            'Instalación y prueba mensual de disyuntores diferenciales y puesta a tierra',
            'No realizar reparaciones provisorias ("atados con alambre")',
            'Secarse las manos completamente antes de conectar o encender cualquier equipo',
          ],
          mediaId: 'media_08d',
        },
        {
          id: '08e',
          name: 'Incendio',
          active: true,
          causes: [
            'Instalaciones eléctricas defectuosas o sobrecargadas',
            'Llamas abiertas desatendidas (hornallas, sopletes de cocina)',
            'Acumulación de grasa en campanas extractoras, filtros y ductos de ventilación',
            'Almacenamiento inadecuado de materiales inflamables cerca de fuentes de calor',
          ],
          measures: [
            'Limpieza y desengrase periódico de campanas extractoras y conductos',
            'Mantener orden y aseo absoluto en la cocina y depósitos',
            'Inspección y mantenimiento anual de extintores portátiles',
            'Conocer las vías de evacuación y mantenerlas libres de obstáculos',
          ],
          mediaId: 'media_08e',
        },
        {
          id: '08f',
          name: 'Productos químicos',
          active: true,
          causes: [
            'Contacto dérmico o inhalación de detergentes industriales',
            'Salpicaduras de productos cáusticos o desengrasantes fuertes',
            'Mezclas peligrosas de productos (por ejemplo, lavandina con detergente o amoníaco)',
            'Falta de rotulación de los envases fraccionados',
          ],
          measures: [
            'Sustituir en lo posible por productos de menor toxicidad',
            'Utilizar obligatoriamente guantes, antiparras y delantal protector',
            'Mantener las hojas de seguridad (FDS) de cada producto al alcance',
            'Almacenar los químicos en áreas ventiladas y en sus envases originales rotulados',
          ],
          mediaId: 'media_08f',
        },
        {
          id: '08g',
          name: 'Sobreesfuerzos',
          active: true,
          causes: [
            'Tendido de camas en hoteles con posturas forzadas',
            'Movimiento y traslado manual de muebles o equipajes pesados',
            'Levantamiento incorrecto de cajones de mercadería o vajilla',
            'Tareas repetitivas de limpieza sin pausas activas',
          ],
          measures: [
            'Conocer el peso de los objetos antes de levantarlos (límite recomendado: 25 kg)',
            'Aplicar técnicas correctas: flexionar rodillas, mantener espalda recta y carga cerca del cuerpo',
            'Utilizar ayudas mecánicas (carros, zorras) para traslados de larga distancia',
            'Rotar tareas y realizar breves estiramientos durante la jornada',
          ],
          mediaId: 'media_08g',
        },
        {
          id: '08h',
          name: 'Primeros Auxilios',
          active: true,
          causes: [
            'Hemorragias por cortes o golpes durante la tarea',
            'Quemaduras por contacto con superficies u objetos calientes',
            'Lesiones musculoesqueléticas por caídas o impactos',
            'Contacto con sangre u otros líquidos corporales sin protección',
          ],
          measures: [
            'Antes de atender: colocarse guantes, antiparras y barbijo como barrera de protección',
            'Hemorragias: aplicar presión directa con la parte plana de los dedos sobre vendaje estéril o apósito limpio',
            'Quemaduras: enfriar con agua fría (no helada) durante 15-30 minutos, no aplicar cremas ni remedios caseros, cubrir con vendaje limpio',
            'Lesiones musculoesqueléticas: no mover la parte afectada, inmovilizar con materiales disponibles, aplicar hielo envuelto máximo 20 minutos',
            'Llamar al 911 o 107 y esperar en el lugar; no trasladar salvo necesidad estricta',
            'Mantener la calma, priorizar lesiones que pongan en peligro la vida y no hacer más de lo necesario hasta que llegue la ayuda profesional',
          ],
          mediaId: 'media_08h',
        },
      ],
    },
    {
      id: 'SLOT_09',
      title: 'Tips Finales',
      active: true,
      fields: {
        tips: [
          'La prevención no es un conjunto de reglas, es una cultura diaria.',
          'Ante un peligro no controlado, detenga la tarea y notifique a su supervisor.',
          'El orden y la limpieza son la base de un establecimiento seguro.',
          'Su salud y su seguridad son lo más valioso del negocio. Cuídese.',
        ],
      },
    },
    {
      id: 'SLOT_10',
      title: 'Cierre',
      active: true,
      fields: {
        closingMessage: 'Los accidentes pueden ocurrir en cualquier tarea. Cada trabajador puede hacer mucho para evitarlos. La seguridad la construimos entre todos.',
        web: 'artprevencionsmg.com.ar',
        brandText: 'Sistema de Autoprotección',
      },
    },
  ],
  media: {
    portada_img: {
      id: 'media_portada',
      placeholderId: 'portada_img',
      type: 'image',
      source: 'upload',
      url: null,
      fileName: 'default_portada.jpg',
    },
    // Visual base (Visual 1) por cada slot de contenido. Los visuales 2 y 3
    // (`${base}_2`, `${base}_3`) los crea la UI de Medios al pegar más URLs.
    'objetivos_img': { id: 'media_objetivos', placeholderId: 'objetivos_img', type: 'image', source: 'upload', url: null },
    'slot_03_img':  { id: 'media_slot_03',  placeholderId: 'slot_03_img',  type: 'image', source: 'upload', url: null },
    'slot_03b_img': { id: 'media_slot_03b', placeholderId: 'slot_03b_img', type: 'image', source: 'upload', url: null },
    'slot_04_img':  { id: 'media_slot_04',  placeholderId: 'slot_04_img',  type: 'image', source: 'upload', url: null },
    'slot_05_img':  { id: 'media_slot_05',  placeholderId: 'slot_05_img',  type: 'image', source: 'upload', url: null },
    'slot_06_img':  { id: 'media_slot_06',  placeholderId: 'slot_06_img',  type: 'image', source: 'upload', url: null },
    'slot_07_img':  { id: 'media_slot_07',  placeholderId: 'slot_07_img',  type: 'image', source: 'upload', url: null },
    'slot_09_img':  { id: 'media_slot_09',  placeholderId: 'slot_09_img',  type: 'image', source: 'upload', url: null },
    'slot_10_img':  { id: 'media_slot_10',  placeholderId: 'slot_10_img',  type: 'image', source: 'upload', url: null },
    'media_08a': { id: 'media_08a_default', placeholderId: 'media_08a', type: 'image', source: 'upload', url: null },
    'media_08b': { id: 'media_08b_default', placeholderId: 'media_08b', type: 'image', source: 'upload', url: null },
    'media_08c': { id: 'media_08c_default', placeholderId: 'media_08c', type: 'image', source: 'upload', url: null },
    'media_08d': { id: 'media_08d_default', placeholderId: 'media_08d', type: 'image', source: 'upload', url: null },
    'media_08e': { id: 'media_08e_default', placeholderId: 'media_08e', type: 'image', source: 'upload', url: null },
    'media_08f': { id: 'media_08f_default', placeholderId: 'media_08f', type: 'image', source: 'upload', url: null },
    'media_08g': { id: 'media_08g_default', placeholderId: 'media_08g', type: 'image', source: 'upload', url: null },
    'media_08h': { id: 'media_08h_default', placeholderId: 'media_08h', type: 'image', source: 'upload', url: null },
  },
  voiceScript: {
    SLOT_01: 'Bienvenidos a la capacitación sobre prevención de riesgos en hoteles y restaurantes. Este tutorial contiene normas fundamentales de higiene y seguridad para proteger su salud y bienestar durante el trabajo.',
    SLOT_02: 'El objetivo principal de este curso es que cada participante conozca los factores que originan riesgos y peligros, permitiéndoles identificar, clasificar y mitigar desvíos para evitar accidentes.',
    SLOT_03: 'Toda nuestra actividad se rige bajo la Ley de Higiene y Seguridad 19.587, su Decreto Reglamentario 351 del 79, y la Ley de Riesgos del Trabajo 24.557. Cumplir estas normativas es una obligación legal y de protección mutua.',
    SLOT_03B: 'La seguridad es una responsabilidad compartida. Los trabajadores deben recibir capacitación y participar en las acciones preventivas, cumplir las normas de higiene y seguridad, informar los riesgos que detecten y denunciar accidentes o enfermedades profesionales. Por su parte, los empleadores deben proveer equipos de protección adecuados, garantizar condiciones seguras, capacitar al personal y denunciar los accidentes a la ART.',
    SLOT_04: 'Es vital diferenciar un accidente, que produce un daño real, de un incidente, donde hubo peligro pero no se concretó el daño. Además, la pirámide de accidentes nos muestra que reducir incidentes diarios evita lesiones graves futuras.',
    SLOT_05: 'Prevenir es un deber moral para no dañar la salud, un mandato legal para reducir siniestros, y una decisión económica y competitiva que disminuye costos de ART, mejora el clima de trabajo y potencia la reputación empresarial.',
    SLOT_06: 'Partimos del principio de que todos los accidentes son evitables. La dirección tiene la responsabilidad de proveer recursos, pero cada empleado es protagonista al formarse en seguridad y aplicar las mejores prácticas operativas.',
    SLOT_07: 'Una buena gestión requiere conductas seguras y orden. Aplicamos siempre la jerarquía de controles: primero eliminar la fuente de peligro, si no es posible sustituirla, aplicar controles de ingeniería, y finalmente proveer Elementos de Protección Personal.',
    '08a': 'Resbalones y caídas. Las principales causas son pisos mojados, desorden o cables sueltos. Para evitarlos use calzado antideslizante, señalice con carteles de piso mojado y mantenga los pasillos limpios y libres de obstáculos.',
    '08b': 'Cortes y atrapamientos. Suelen ocurrir al usar picadoras o rebanadoras sin protección, o por distracción con cuchillos. Utilice guantes de malla de acero, verifique que los protectores mecánicos estén colocados y mantenga las herramientas afiladas.',
    '08c': 'Quemaduras. Son causadas por contacto con superficies de hornos, freidoras o salpicaduras de aceites. Use siempre manoplas y guantes térmicos, apunte los mangos hacia adentro y retire las tapas de ollas de forma que el vapor salga en dirección opuesta.',
    '08d': 'Riesgo eléctrico. Se origina por tomas sobrecargadas, cables dañados o uso de aparatos con manos húmedas. Reporte cables pelados, verifique el disyuntor mensual y nunca opere equipos eléctricos con manos mojadas o pisos húmedos.',
    '08e': 'Peligro de incendios. La acumulación de grasa en campanas y fallas eléctricas son los mayores riesgos en cocinas. Mantenga limpia y desengrasada la campana de extracción, conozca la ubicación de extintores y las vías de evacuación.',
    '08f': 'Productos químicos. El contacto con detergentes industriales o mezclas peligrosas como cloro con amoníaco causan lesiones. Use guantes de nitrilo, antiparras, lea las hojas de seguridad y rotule siempre los envases fraccionados.',
    '08g': 'Sobreesfuerzos. Levantar cargas pesadas o doblarse al tender camas genera lesiones lumbares. Flexione las piernas, mantenga la espalda recta, acerque la carga al cuerpo y solicite ayuda o carros para pesos mayores a 25 kilos.',
    '08h': 'Primeros Auxilios. Ante una emergencia, lo primero es protegerse: use guantes y barbijo antes de asistir. Para hemorragias, aplique presión directa con un vendaje sobre la herida. En quemaduras, enfríe con agua fría durante quince a treinta minutos sin aplicar cremas. Ante una posible fractura, no mueva a la persona e inmovilice la zona. Llame al novecientos once o al ciento siete y espere a los profesionales. Recuerde: mantenga la calma, priorice las lesiones graves y no haga más de lo necesario.',
    SLOT_09: 'Recuerde: la prevención no es una regla impuesta, es un hábito diario para regresar a salvo a su hogar. Ante cualquier peligro no controlado en su sector, informe inmediatamente a su superior. La seguridad la hacemos entre todos.',
    SLOT_10: 'Muchas gracias por su atención y compromiso con la seguridad. Para más información e instructivos detallados, puede visitar nuestro sitio oficial art prevencion smg punto com punto ar.',
  },
  voiceAudioUrls: {},
  renderStatus: 'idle',
  renderProgress: 0,
};

export const mockProjectTutorial02: Project = {
  id: 'demo_project_02',
  projectName: 'Plan de Autoprotección y Evacuación CABA',
  clientName: 'SUAMA Demo Client',
  companyName: '',
  industry: 'Empresa genérica',
  tutorialId: 'tutorial_incendios',
  identity: {
    logoUrl: null,
    colors: {
      primary: '#e11d48',    // Rojo Intenso para Incendios
      secondary: '#1e293b',  // Gris pizarra oscuro
      accent: '#f59e0b',     // Naranja/Amarillo de advertencia
      background: '#0f172a', // Fondo pizarra oscuro
      text: '#f8fafc',       // Texto casi blanco
    },
    fontFamily: 'kiona',
  },
  slots: [
    {
      id: 'SLOT_01',
      title: 'Portada',
      active: true,
      fields: {
        title: 'Prevención de Incendios y Plan de Evacuación',
        subtitle: 'Sistema de Autoprotección Obligatorio',
      },
    },
    {
      id: 'SLOT_02',
      title: 'Objetivos',
      active: true,
      fields: {
        objectivesText: 'Al término del curso, el participante conocerá el concepto de evacuación, el organigrama de roles en emergencias, la clasificación del fuego y el uso correcto de extintores.',
      },
    },
    {
      id: 'SLOT_03',
      title: 'Marco Legal',
      active: true,
      fields: {
        laws: [
          'Ley 5920 CABA - Sistema de Autoprotección',
          'Ordenanzas Municipales sobre seguridad edilicia',
        ],
        description: 'La Ley 5920 establece la obligatoriedad de contar con un Sistema de Autoprotección y realizar simulacros de evacuación periódicos en la Ciudad Autónoma de Buenos Aires.',
      },
    },
    {
      id: 'SLOT_04',
      title: 'Definiciones Clave',
      active: false,
      fields: {
        definitions: [],
      },
    },
    {
      id: 'SLOT_05',
      title: 'Razones para la Prevención',
      active: false,
      fields: {},
    },
    {
      id: 'SLOT_06',
      title: 'Principios Clave',
      active: true,
      fields: {
        principles: [
          'El fuego es una reacción química de oxidación rápida que produce calor y luz (triángulo del fuego).',
          'El humo y los gases tóxicos son responsables del 75% de las muertes en un incendio.',
          'La detección temprana y la acción inmediata marcan la diferencia entre un susto y una tragedia.',
          'La evacuación debe priorizar siempre la vida humana sobre los bienes materiales.',
        ],
      },
    },
    {
      id: 'SLOT_07',
      title: 'Gestión y Roles',
      active: true,
      fields: {
        managementDescription: 'El plan de autoprotección designa roles específicos que deben actuar coordinadamente frente a una alarma.',
        dangerAnalysis: 'Flujo de emergencia: Aviso/Alarma → Evacuación ordenada → Extinción primaria en su fase inicial.',
        hierarchyOfControls: 'Mantenga la calma, no use ascensores, desplácese agachado si hay humo y diríjase al Punto de Encuentro.',
        responsibilities: [
          'Grupo de Alerta: Da el aviso a bomberos y corta los suministros de gas y electricidad.',
          'Grupo de Evacuación: Dirige a los ocupantes hacia las salidas de emergencia de forma ordenada.',
          'Grupo de Extinción: Utiliza los extintores para combatir el fuego en su fase inicial (principio de incendio).',
        ],
      },
    },
    {
      id: 'SLOT_08',
      title: 'Módulos de Riesgo',
      active: true,
      fields: {},
      riskModules: [
        {
          id: '08a',
          name: 'Clases de fuego',
          active: true,
          causes: [
            'Clase A: Sólidos combustibles que dejan brasas (madera, papel, cartón, telas)',
            'Clase B: Líquidos y gases inflamables (combustibles, disolventes, grasas)',
            'Clase C: Equipos eléctricos energizados (computadoras, motores, tableros)',
            'Clase K: Grasas y aceites de cocina (vegetales y animales)',
          ],
          measures: [
            'Identificar la clase de fuego antes de elegir el extintor de extinción.',
            'Nunca usar agua en fuegos Clase C (riesgo de electrocución).',
            'En cocinas, apagar el extractor y usar extintor de acetato de potasio Clase K.',
          ],
          mediaId: 'media_08a_fire',
        },
        {
          id: '08b',
          name: 'Tipos de extintores',
          active: true,
          causes: [
            'Uso de extintor inadecuado que propaga o empeora el incendio',
            'Matafuegos vencidos o con presión inadecuada',
          ],
          measures: [
            'Polvo Químico Seco (ABC): Es el más común y apaga fuegos sólidos, líquidos y eléctricos.',
            'Dióxido de Carbono (CO₂): No conduce electricidad, enfría y desplaza oxígeno. Ideal para tableros eléctricos porque no daña los componentes.',
            'Acetato de Potasio: Específico para cocinas comerciales debido a su efecto de saponificación.',
          ],
          mediaId: 'media_08b_fire',
        },
        {
          id: '08c',
          name: 'Uso del extintor',
          active: true,
          causes: [
            'Pánico al enfrentar un principio de incendio sin saber cómo actuar',
            'Soplar o avivar las llamas por mala técnica de disparo',
          ],
          measures: [
            '1. Descolgar el matafuegos, retirar el precinto y tirar de la chaveta de seguridad.',
            '2. Realizar un disparo corto de prueba apuntando al suelo antes de acercarse.',
            '3. Ubicarse con el viento a favor y la salida de emergencia a su espalda.',
            '4. Apuntar la boquilla hacia la base de las llamas y presionar el gatillo de forma intermitente.',
            '5. Realizar un movimiento de barrido en zig-zag sobre el fuego.',
          ],
          mediaId: 'media_08c_fire',
        },
      ],
    },
    {
      id: 'SLOT_09',
      title: 'Tips Finales',
      active: true,
      fields: {
        tips: [
          'La evacuación debe realizarse sin correr pero sin detenerse, manteniendo el orden.',
          'Si se encuentra atrapado en una oficina, selle la parte inferior de la puerta con paños húmedos.',
          'Nunca regrese por objetos personales: su vida vale más que cualquier pertenencia.',
          'Conozca de antemano el plano de evacuación de su sector y el Punto de Encuentro exterior.',
        ],
      },
    },
    {
      id: 'SLOT_10',
      title: 'Cierre',
      active: true,
      fields: {
        closingMessage: 'La seguridad no es casualidad, es el resultado del esfuerzo conjunto de todos. Muchas gracias por participar en este simulacro y capacitación.',
        web: 'artprevencionsmg.com.ar',
        brandText: 'Sistema de Autoprotección',
      },
    },
  ],
  media: {
    portada_img: {
      id: 'media_portada_02',
      placeholderId: 'portada_img',
      type: 'image',
      source: 'upload',
      url: null,
      fileName: 'default_portada_fire.jpg',
    },
    // Visual base (Visual 1) por slot de contenido activo del tutorial 02.
    // SLOT_04 y SLOT_05 están inactivos en este tutorial → sin placeholder.
    'objetivos_img': { id: 'media_objetivos_02', placeholderId: 'objetivos_img', type: 'image', source: 'upload', url: null },
    'slot_03_img':  { id: 'media_slot_03_02',  placeholderId: 'slot_03_img',  type: 'image', source: 'upload', url: null },
    'slot_06_img':  { id: 'media_slot_06_02',  placeholderId: 'slot_06_img',  type: 'image', source: 'upload', url: null },
    'slot_07_img':  { id: 'media_slot_07_02',  placeholderId: 'slot_07_img',  type: 'image', source: 'upload', url: null },
    'slot_09_img':  { id: 'media_slot_09_02',  placeholderId: 'slot_09_img',  type: 'image', source: 'upload', url: null },
    'slot_10_img':  { id: 'media_slot_10_02',  placeholderId: 'slot_10_img',  type: 'image', source: 'upload', url: null },
    'media_08a_fire': { id: 'media_08a_fire_default', placeholderId: 'media_08a_fire', type: 'image', source: 'upload', url: null },
    'media_08b_fire': { id: 'media_08b_fire_default', placeholderId: 'media_08b_fire', type: 'image', source: 'upload', url: null },
    'media_08c_fire': { id: 'media_08c_fire_default', placeholderId: 'media_08c_fire', type: 'image', source: 'upload', url: null },
  },
  voiceScript: {
    SLOT_01: 'Bienvenidos al módulo sobre Prevención de Incendios y Plan de Evacuación. En este video tutorial revisaremos cómo actuar ante una emergencia y las pautas para una evacuación rápida y segura.',
    SLOT_02: 'Los objetivos primordiales de esta capacitación son aprender el concepto de evacuación ordenada, comprender los roles asignados a cada grupo, e identificar las clases de fuego para usar correctamente los extintores.',
    SLOT_03: 'En el ámbito de la Ciudad Autónoma de Buenos Aires, nos rige la Ley 5920, la cual obliga a los establecimientos comerciales a poseer un Sistema de Autoprotección homologado, con simulacros regulares.',
    SLOT_06: 'Entendemos al fuego como el triángulo compuesto por combustible, oxígeno y calor. Es fundamental saber que el 75 por ciento de las fatalidades ocurren por inhalación de humos y gases calientes, no por las quemaduras directas.',
    SLOT_07: 'El organigrama de emergencias se compone de tres grupos: el Grupo de Alerta, encargado de llamar a bomberos y cortar servicios; el Grupo de Evacuación, que coordina la salida al Punto de Encuentro; y el Grupo de Extinción, que combate el fuego inicial.',
    '08a': 'Clases de fuego. Distinguimos los de clase A para sólidos como madera o telas; clase B para combustibles y líquidos; clase C para artefactos eléctricos con tensión; y clase K para aceites de freidoras en cocinas.',
    '08b': 'Tipos de extintores. Recuerde utilizar el adecuado: Polvo Químico ABC para fuegos múltiples, CO2 de nieve carbónica para tableros eléctricos sin dañarlos, y extintores K de acetato de potasio para fuegos de grasas.',
    '08c': 'Uso correcto del matafuegos. Descuelgue y retire el precinto. Ubíquese con el viento a su favor y con una vía de escape despejada a su espalda. Apunte directo a la base de las llamas y realice movimientos de barrido continuo.',
    '09': 'En caso de tener que evacuar, recuerde desplazarse a gatas si hay humo en el pasillo, no utilizar los ascensores por riesgo de quedar atrapado, y dirigirse con calma y sin correr hacia el Punto de Encuentro exterior.',
    SLOT_10: 'Agradecemos su atención y compromiso diario con las prácticas del plan de autoprotección. Recuerde que ante una emergencia, la tranquilidad y el conocimiento salvan vidas.',
  },
  voiceAudioUrls: {},
  renderStatus: 'idle',
  renderProgress: 0,
};

// ── Variantes de la estructura de riesgos ────────────────────────────────────

function cloneTutorial(base: Project, overrides: Partial<Project>): Project {
  const clone: Project = JSON.parse(JSON.stringify(base));
  return { ...clone, ...overrides, slots: overrides.slots ?? clone.slots };
}

function withSlotTitle(base: Project, slotId: string, title: string): Project['slots'] {
  const slots: Project['slots'] = JSON.parse(JSON.stringify(base.slots));
  const slot = slots.find(s => s.id === slotId);
  if (slot?.fields) slot.fields.title = title;
  return slots;
}

export const mockProjectHotelesSinCocina: Project = (() => {
  const slots: Project['slots'] = JSON.parse(JSON.stringify(mockProjectTutorial01.slots));
  const slot01 = slots.find(s => s.id === 'SLOT_01');
  if (slot01?.fields) slot01.fields.title = 'Prevención de riesgos en hoteles';
  const slot08 = slots.find(s => s.id === 'SLOT_08');
  if (slot08?.riskModules) {
    const rm08b = slot08.riskModules.find(r => r.id === '08b');
    if (rm08b) rm08b.active = false;
    const rm08c = slot08.riskModules.find(r => r.id === '08c');
    if (rm08c) {
      rm08c.causes = [
        'Contacto accidental con tuberías de agua caliente o vapor sin aislar',
        'Manipulación de equipos de planchado industrial en lavandería',
        'Superficies calientes de calderas y sistemas de calefacción',
        'Traslado de recipientes calientes durante tareas de mantenimiento',
      ];
      rm08c.measures = [
        'Verificar el aislamiento térmico de tuberías y equipos antes de intervenir',
        'Utilizar guantes térmicos homologados y ropa de manga larga en tareas de mantenimiento',
        'Señalizar tuberías y superficies calientes con cartelería visible',
        'Esperar el enfriamiento adecuado de equipos antes de realizar tareas de limpieza o reparación',
      ];
    }
    const rm08e = slot08.riskModules.find(r => r.id === '08e');
    if (rm08e) {
      rm08e.causes = [
        'Fallas en instalaciones eléctricas o sobrecarga de tomas',
        'Desperfectos en sistemas de calefacción y calderas',
        'Acumulación de materiales inflamables en depósitos y lavandería',
        'Detectores de humo obstruidos o fuera de servicio',
      ];
      rm08e.measures = [
        'Inspeccionar periódicamente instalaciones eléctricas, calefacción y calderas',
        'Mantener despejadas y señalizadas las áreas con extintores y mangueras contra incendios',
        'Ordenar y controlar el almacenamiento de materiales inflamables en depósitos y lavandería',
        'Verificar que los detectores de humo estén operativos y sin obstrucciones',
        'Conocer y mantener libres las vías de evacuación en pasillos y habitaciones',
      ];
    }
  }
  const voiceScript = { ...mockProjectTutorial01.voiceScript };
  voiceScript.SLOT_01 = 'Bienvenidos a la capacitación sobre prevención de riesgos en hoteles. Este tutorial contiene normas fundamentales de higiene y seguridad para proteger su salud y bienestar durante el trabajo.';
  voiceScript['08c'] = 'Quemaduras. En tareas de mantenimiento, las tuberías de agua caliente y vapor sin aislar son una causa frecuente de quemaduras. Use siempre guantes térmicos, verifique el aislamiento antes de intervenir y espere el enfriamiento de los equipos antes de limpiarlos. En trabajos de soldadura, use siempre careta, guantes térmicos y ropa ignífuga, y asegúrese de contar con extintor cerca del área.';
  voiceScript['08e'] = 'Peligro de incendios. En hoteles, las principales causas de incendio son fallas en instalaciones eléctricas, sistemas de calefacción y calderas, y acumulación de materiales inflamables en áreas de almacenamiento y lavandería. Conozca la ubicación de extintores y mangueras contra incendios en su área de trabajo, y verifique que los detectores de humo estén operativos y sin obstrucciones.';
  return cloneTutorial(mockProjectTutorial01, {
    id: 'demo_hoteles_sin_cocina',
    projectName: 'Capacitación General SMG - Hotelería (sin cocina)',
    tutorialId: 'tutorial_hoteles_sin_cocina',
    slots,
    voiceScript,
  });
})();

export const mockProjectHospitales: Project = (() => {
  const slots = withSlotTitle(mockProjectTutorial01, 'SLOT_01', 'Prevención de riesgos en hospitales');
  const voiceScript = { ...mockProjectTutorial01.voiceScript };
  voiceScript.SLOT_01 = 'Bienvenidos a la capacitación sobre prevención de riesgos en hospitales. Este tutorial contiene normas fundamentales de higiene y seguridad para proteger su salud y bienestar durante el trabajo.';
  return cloneTutorial(mockProjectTutorial01, {
    id: 'demo_hospitales',
    projectName: 'Capacitación General SMG - Hospitales',
    industry: 'Hospital',
    tutorialId: 'tutorial_hospitales',
    slots,
    voiceScript,
  });
})();

export const mockProjectSupermercados: Project = (() => {
  const slots = withSlotTitle(mockProjectTutorial01, 'SLOT_01', 'Prevención de riesgos en supermercados');
  const slot08 = slots.find(s => s.id === 'SLOT_08');
  const rm08c = slot08?.riskModules?.find(r => r.id === '08c');
  if (rm08c) {
    rm08c.causes = [
      'Contacto accidental con tuberías de agua caliente o vapor sin aislar',
      'Superficies calientes de calderas, compresores y sistemas de refrigeración',
      'Trabajos de soldadura y mantenimiento de instalaciones',
      'Traslado de recipientes o piezas calientes durante tareas de mantenimiento',
    ];
    rm08c.measures = [
      'Verificar el aislamiento térmico de tuberías y equipos antes de intervenir',
      'Utilizar guantes térmicos homologados y ropa de manga larga en tareas de mantenimiento',
      'En trabajos de soldadura, usar careta, guantes térmicos, ropa ignífuga y mantener extintor cerca del área',
      'Señalizar tuberías y superficies calientes con cartelería visible',
      'Esperar el enfriamiento adecuado de equipos antes de realizar tareas de limpieza o reparación',
    ];
  }
  const rm08e = slot08?.riskModules?.find(r => r.id === '08e');
  if (rm08e) {
    rm08e.causes = [
      'Fallas eléctricas en sistemas de frío central y cámaras de refrigeración',
      'Desperfectos en hornos y equipos de panadería',
      'Acumulación de cartón, plásticos y embalajes en el depósito',
      'Sobrecarga de tomas e instalaciones eléctricas en salón de ventas y oficinas',
    ];
    rm08e.measures = [
      'Inspeccionar y mantener los sistemas de frío central y los hornos de panadería',
      'Retirar cartón y plásticos acumulados del depósito de forma periódica',
      'Mantener despejadas y señalizadas las columnas con matafuegos e hidrantes',
      'Verificar que los detectores de humo estén operativos y sin obstrucciones por mercadería apilada en los racks',
      'Conocer la ubicación de matafuegos e hidrantes en salón de ventas, depósito y oficinas',
    ];
  }
  const rm08g = slot08?.riskModules?.find(r => r.id === '08g');
  if (rm08g) {
    rm08g.causes = [
      'Levantamiento manual de cajas y bultos de mercadería sin técnica adecuada',
      'Traslado de pallets, cajones y bebidas sin usar carros o zorras',
      'Reposición de góndolas con posturas forzadas o giros bruscos',
      'Tareas repetitivas de carga y descarga sin pausas activas',
    ];
    rm08g.measures = [
      'Conocer el peso de los objetos antes de levantarlos (límite recomendado: 25 kg)',
      'Aplicar técnicas correctas: flexionar rodillas, mantener espalda recta y carga cerca del cuerpo',
      'Utilizar equipo de carga (carros, zorras, carritos) para traslados de mercadería pesada',
      'Rotar tareas y realizar pausas activas durante la jornada',
    ];
  }
  const voiceScript = { ...mockProjectTutorial01.voiceScript };
  voiceScript.SLOT_01 = 'Bienvenidos a la capacitación sobre prevención de riesgos en supermercados. Este tutorial contiene normas fundamentales de higiene y seguridad para proteger su salud y bienestar durante el trabajo.';
  voiceScript['08c'] = 'Quemaduras. En tareas de mantenimiento, las tuberías de agua caliente y vapor sin aislar son una causa frecuente de quemaduras. Use siempre guantes térmicos, verifique el aislamiento antes de intervenir y espere el enfriamiento de los equipos antes de limpiarlos. En trabajos de soldadura, use siempre careta, guantes térmicos y ropa ignífuga, y asegúrese de contar con extintor cerca del área.';
  voiceScript['08e'] = 'Peligro de incendios. En supermercados, las principales causas de incendio son fallas eléctricas en sistemas de frío central, desperfectos en hornos de panadería y la acumulación de cartón o plásticos en el depósito. Identifique la ubicación de los matafuegos e hidrantes instalados en columnas y pasillos tanto en oficinas como en el salón de ventas, y verifique que los detectores de humo en el techo estén operativos y sin obstrucciones por mercadería apilada en los racks.';
  voiceScript['08g'] = 'Sobreesfuerzos. El traslado manual de cajas, pallets y cajones de bebidas es una causa frecuente de lesiones lumbares en supermercados. Flexione las piernas, mantenga la espalda recta, acerque la carga al cuerpo y utilice carros o zorras para trasladar pesos mayores a 25 kilos.';
  return cloneTutorial(mockProjectTutorial01, {
    id: 'demo_supermercados',
    projectName: 'Capacitación General SMG - Supermercados',
    industry: 'Supermercado',
    tutorialId: 'tutorial_supermercados',
    slots,
    voiceScript,
  });
})();

// ── Estructura propia: Clasificación de Residuos ─────────────────────────────
// No sigue la estructura madre de riesgos (fuente: PDF "Plan de Manejo
// Responsable de Residuos - Nosotros Separamos"). Reutiliza el mismo motor de
// slots/riskModules, pero con SLOT_05 y SLOT_06 desactivados (sin contenido
// equivalente en la fuente) y SLOT_08 reinterpretado como categorías de
// residuos en lugar de riesgos.

export const mockProjectResiduos: Project = {
  id: 'demo_project_03',
  projectName: 'Plan de Manejo Responsable de Residuos',
  clientName: 'SUAMA Demo Client',
  companyName: '',
  industry: 'Empresa genérica',
  tutorialId: 'tutorial_residuos',
  identity: {
    logoUrl: null,
    colors: {
      primary: '#16a34a',    // Verde (residuos húmedos / reciclaje)
      secondary: '#0284c7',  // Azul (residuos secos)
      accent: '#f59e0b',     // Ámbar (residuos peligrosos / advertencia)
      background: '#ffffff',
      text: '#1e293b',
    },
    fontFamily: 'inter',
  },
  slots: [
    {
      id: 'SLOT_01',
      title: 'Portada',
      active: true,
      fields: {
        title: 'Plan de Manejo Responsable de Residuos',
        subtitle: 'Nosotros Separamos',
      },
    },
    {
      id: 'SLOT_02',
      title: 'Objetivos',
      active: true,
      fields: {
        objectivesText: 'Conocer los materiales susceptibles de separación y reciclaje para realizar correctamente la separación de residuos húmedos y secos en origen, reduciendo el impacto ambiental de nuestra actividad y cumpliendo con la normativa vigente de gestión de residuos.',
      },
    },
    {
      id: 'SLOT_03',
      title: 'Marco Legal',
      active: true,
      fields: {
        laws: [
          'Ley 1854 – Gestión Integral de Residuos Sólidos Urbanos (GIRSU)',
          '"Basura Cero" – Reducción progresiva de la disposición final de residuos sólidos urbanos',
          '"Nosotros Separamos" – Plan de manejo responsable de residuos para generadores especiales',
        ],
        description: 'La gestión de residuos en nuestro sector se enmarca en un plan normativo progresivo: desde la gestión integral de los residuos sólidos urbanos hasta la obligación de separar en origen como generadores especiales.',
      },
    },
    {
      id: 'SLOT_04',
      title: 'Definiciones Clave',
      active: true,
      fields: {
        definitions: [
          { term: 'Residuos húmedos', definition: 'Residuos generales no reciclables que van al contenedor negro y a disposición final: restos de comida, envoltorios sucios, papel higiénico, cerámica y porcelana.' },
          { term: 'Residuos secos', definition: 'Materiales reciclables que se separan en dos contenedores: verde para envases reciclables (plásticos, metales y vidrio) y amarillo para papel y cartón. El material debe estar lavado, limpio y seco.' },
          { term: 'Residuos peligrosos', definition: 'Prohibidos en todos los contenedores; requieren gestión especial: inflamables, liberadores de gases tóxicos, insecticidas, pilas, tintas, látex, resinas y cartuchos de impresoras.' },
          { term: 'Recolección diferenciada', definition: 'Retiro semanal de los residuos secos a cargo de una Cooperativa de Recuperadores Urbanos, separado de la recolección normal diaria de residuos húmedos.' },
        ],
      },
    },
    {
      id: 'SLOT_05',
      title: 'Razones para la Prevención',
      active: false,
      fields: {},
    },
    {
      id: 'SLOT_06',
      title: 'Principios Clave',
      active: false,
      fields: {},
    },
    {
      id: 'SLOT_07',
      title: 'Gestión y Roles',
      active: true,
      fields: {
        managementDescription: '¿Cómo es la recolección? Recolección normal: todos los días de la semana, para los residuos húmedos del contenedor negro. Recolección diferenciada: una vez por semana, a cargo de una Cooperativa de Recuperadores Urbanos, para los residuos secos de los contenedores verde y amarillo.',
        hierarchyOfControls: 'Jerarquía de gestión de residuos: 1. Reducir el consumo | 2. Reutilizar materiales | 3. Reciclar separando en origen | 4. Disponer correctamente lo no reciclable.',
        responsibilities: [
          'Comité de seguimiento: designar responsables de controlar el correcto cumplimiento de la separación de residuos.',
          'Actitud activa y responsable: todo el personal debe involucrarse en la separación de residuos secos y húmedos en su sector de trabajo.',
        ],
      },
    },
    {
      id: 'SLOT_08',
      title: 'Módulos de Riesgo',
      active: true,
      fields: {},
      riskModules: [
        {
          id: '08a',
          name: 'Envases Reciclables (Verde)',
          active: true,
          causes: [
            'Botellas y bidones plásticos',
            'Bolsas y envases plásticos',
            'Vajilla descartable y telgopor',
            'Metales, latas y tapas',
            'Botellas y frascos de vidrio (vacíos, sin líquido)',
          ],
          measures: [
            'El material debe estar lavado, limpio y seco',
            'Aplastar botellas plásticas y latas para reducir el volumen',
            'Depositarlo en el contenedor VERDE',
          ],
          mediaId: 'media_08a',
        },
        {
          id: '08b',
          name: 'Papel y Cartón (Amarillo)',
          active: true,
          causes: [
            'Hojas, folios, cuadernos y libretas',
            'Cajas de cartón',
            'Diarios, revistas, fotocopias y publicidad',
            'Textiles, telas y trapos',
          ],
          measures: [
            'El material debe estar limpio y seco',
            'Doblar las cajas de cartón para ahorrar espacio',
            'Depositarlo en el contenedor AMARILLO',
          ],
          mediaId: 'media_08b',
        },
        {
          id: '08c',
          name: 'Húmedos / No Reciclables (Negro)',
          active: true,
          causes: [
            'Restos de comida y envoltorios sucios',
            'Papel higiénico, pañales y apósitos femeninos',
            'Cerámica, porcelana, goma, corcho y plastificados',
            'Vidrios rotos o aislados (envueltos en papel)',
          ],
          measures: [
            'Depositarlos en el contenedor NEGRO',
            'Los vidrios rotos o aislados van envueltos en papel para evitar cortes',
            'Van a disposición final con la recolección normal diaria',
          ],
          mediaId: 'media_08c',
        },
        {
          id: '08d',
          name: 'Residuos Peligrosos Prohibidos',
          active: true,
          causes: [
            'Líquidos o sólidos inflamables',
            'Liberadores de gases tóxicos',
            'Desechos fitosanitarios (insecticidas)',
            'Pilas y derivados de tintas',
            'Resinas, plastificantes y cartuchos de impresoras',
            'Lámparas y tubos con su envase',
          ],
          measures: [
            'Prohibidos en los tres contenedores (negro, verde y amarillo)',
            'Almacenarlos en un recipiente separado e identificado',
            'Gestionar su retiro a través de un operador habilitado o punto de acopio específico',
          ],
          mediaId: 'media_08d',
        },
      ],
    },
    {
      id: 'SLOT_09',
      title: 'Tips Finales',
      active: true,
      fields: {
        tips: [
          'Separá antes de tirar: húmedos al contenedor negro; secos al verde (envases) y al amarillo (papel y cartón).',
          'El material reciclable debe estar siempre lavado, limpio y seco.',
          'El vidrio se recicla: botellas y frascos vacíos y sin líquido van al contenedor verde; solo los vidrios rotos van al negro, envueltos en papel.',
          'Los residuos peligrosos (pilas, inflamables, insecticidas, tintas) nunca van a los contenedores comunes.',
        ],
      },
    },
    {
      id: 'SLOT_10',
      title: 'Cierre',
      active: true,
      fields: {
        closingMessage: '¡Gracias por su participación! Juntos construimos un ambiente de trabajo más limpio y sustentable.',
        web: '',
        brandText: '',
      },
    },
  ],
  media: {
    portada_img: {
      id: 'media_portada_03',
      placeholderId: 'portada_img',
      type: 'image',
      source: 'upload',
      url: null,
    },
    'objetivos_img': { id: 'media_objetivos_03', placeholderId: 'objetivos_img', type: 'image', source: 'upload', url: null },
    'slot_03_img':  { id: 'media_slot_03_03',  placeholderId: 'slot_03_img',  type: 'image', source: 'upload', url: null },
    'slot_04_img':  { id: 'media_slot_04_03',  placeholderId: 'slot_04_img',  type: 'image', source: 'upload', url: null },
    'slot_07_img':  { id: 'media_slot_07_03',  placeholderId: 'slot_07_img',  type: 'image', source: 'upload', url: null },
    'slot_09_img':  { id: 'media_slot_09_03',  placeholderId: 'slot_09_img',  type: 'image', source: 'upload', url: null },
    'slot_10_img':  { id: 'media_slot_10_03',  placeholderId: 'slot_10_img',  type: 'image', source: 'upload', url: null },
    'media_08a': { id: 'media_08a_residuos_default', placeholderId: 'media_08a', type: 'image', source: 'upload', url: null },
    'media_08b': { id: 'media_08b_residuos_default', placeholderId: 'media_08b', type: 'image', source: 'upload', url: null },
    'media_08c': { id: 'media_08c_residuos_default', placeholderId: 'media_08c', type: 'image', source: 'upload', url: null },
    'media_08d': { id: 'media_08d_residuos_default', placeholderId: 'media_08d', type: 'image', source: 'upload', url: null },
  },
  voiceScript: {
    SLOT_01: 'Bienvenidos al Plan de Manejo Responsable de Residuos. En este tutorial vamos a aprender a separar correctamente los residuos húmedos y secos, cumpliendo con la normativa vigente y cuidando el ambiente.',
    SLOT_02: 'El objetivo de esta capacitación es que cada participante conozca los materiales que se pueden separar y reciclar, para realizar correctamente la separación de residuos húmedos y secos en origen, reduciendo el impacto ambiental de nuestra actividad.',
    SLOT_03: 'Nuestra gestión de residuos se enmarca en la Ley de Gestión Integral de Residuos Sólidos Urbanos, el programa Basura Cero de reducción progresiva de la disposición final, y el plan Nosotros Separamos, que nos exige actuar como generadores especiales.',
    SLOT_04: 'Es importante diferenciar los residuos húmedos, que son los generales no reciclables y se destinan a disposición final, de los secos, que sí son reciclables. Para una mejor distribución, los residuos húmedos deben depositarse en contenedores de color negro, mientras que los residuos secos pueden separarse en dos categorías: el verde para envases de plástico, metal y vidrio, y el amarillo para papel y cartón. El material reciclable debe estar siempre lavado, limpio y seco. Además, existen residuos peligrosos, como pilas, materiales inflamables e insecticidas, que están prohibidos en todos los contenedores y requieren una gestión especial.',
    SLOT_07: 'La recolección normal de los húmedos es diaria, mientras que la recolección diferenciada de los secos la realiza semanalmente una cooperativa de recuperadores urbanos. Es fundamental formar un comité de seguimiento y que todo el personal asuma una actitud activa y responsable con la separación en su sector.',
    '08a': 'Envases reciclables. Botellas, bidones, bolsas y envases plásticos, vajilla descartable, telgopor, metales, latas y tapas, y también botellas y frascos de vidrio, siempre vacíos y sin líquido. El material debe estar lavado, limpio y seco. Aplastá las botellas plásticas y las latas para reducir el volumen, y depositalo en el contenedor verde.',
    '08b': 'Papel y cartón. Hojas, cajas, diarios, revistas, fotocopias, folios, cuadernos, publicidad, y también textiles, telas y trapos. El material debe estar limpio y seco. Doblá las cajas para ahorrar espacio, y depositalo en el contenedor amarillo.',
    '08c': 'Residuos húmedos y generales no reciclables. Restos de comida, envoltorios sucios, papel higiénico, pañales, cerámica, porcelana, goma, corcho, plastificados. También los vidrios rotos o aislados, siempre envueltos en papel para evitar cortes. Todo va al contenedor negro, con la recolección normal diaria.',
    '08d': 'Residuos peligrosos prohibidos. Líquidos o sólidos inflamables, liberadores de gases tóxicos, insecticidas, pilas, derivados de tintas, látex, resinas, plastificantes, lámparas y tubos con su envase y cartuchos de impresoras. Están prohibidos en los tres contenedores: deben almacenarse por separado y gestionarse a través de un operador habilitado o un punto de acopio específico.',
    SLOT_09: 'Recordá separar antes de tirar: los húmedos van al contenedor negro, y los secos al verde para envases y al amarillo para papel y cartón. El material reciclable debe estar lavado, limpio y seco. El vidrio se recicla: botellas y frascos vacíos van al verde, y solo los vidrios rotos van al negro, envueltos en papel. Los residuos peligrosos nunca van a los contenedores comunes.',
    SLOT_10: 'Muchas gracias por su participación. Juntos construimos un ambiente de trabajo más limpio y sustentable.',
  },
  voiceAudioUrls: {},
  renderStatus: 'idle',
  renderProgress: 0,
};

export const TUTORIAL_MOCK_DATA: Record<string, Project> = {
  tutorial_hoteles_cocina: mockProjectTutorial01,
  tutorial_hoteles_sin_cocina: mockProjectHotelesSinCocina,
  tutorial_hospitales: mockProjectHospitales,
  tutorial_supermercados: mockProjectSupermercados,
  tutorial_incendios: mockProjectTutorial02,
  tutorial_residuos: mockProjectResiduos,
};

