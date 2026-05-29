import { Project } from './types';
import { SUAMA_COLORS } from './constants';

export const mockProjectTutorial01: Project = {
  id: 'demo_project_01',
  projectName: 'Capacitación General SMG - Hotelería',
  clientName: 'SUAMA Demo Client',
  companyName: '',
  industry: 'Hotel',
  tutorialId: 'tutorial_01',
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
        title: 'Prevención de riesgos en hoteles y restaurantes',
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
    'media_08a': { id: 'media_08a_default', placeholderId: 'media_08a', type: 'image', source: 'upload', url: null },
    'media_08b': { id: 'media_08b_default', placeholderId: 'media_08b', type: 'image', source: 'upload', url: null },
    'media_08c': { id: 'media_08c_default', placeholderId: 'media_08c', type: 'image', source: 'upload', url: null },
    'media_08d': { id: 'media_08d_default', placeholderId: 'media_08d', type: 'image', source: 'upload', url: null },
    'media_08e': { id: 'media_08e_default', placeholderId: 'media_08e', type: 'image', source: 'upload', url: null },
    'media_08f': { id: 'media_08f_default', placeholderId: 'media_08f', type: 'image', source: 'upload', url: null },
    'media_08g': { id: 'media_08g_default', placeholderId: 'media_08g', type: 'image', source: 'upload', url: null },
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
    SLOT_09: 'Recuerde: la prevención no es una regla impuesta, es un hábito diario para regresar a salvo a su hogar. Ante cualquier peligro no controlado en su sector, informe inmediatamente a su superior. La seguridad la hacemos entre todos.',
    SLOT_10: 'Muchas gracias por su atención y compromiso con la seguridad. Para más información e instructivos detallados, puede visitar nuestro sitio oficial art prevencion smg punto com punto ar.',
  },
  voiceAudioUrl: null,
  renderStatus: 'idle',
  renderProgress: 0,
};

export const mockProjectTutorial02: Project = {
  id: 'demo_project_02',
  projectName: 'Plan de Autoprotección y Evacuación CABA',
  clientName: 'SUAMA Demo Client',
  companyName: '',
  industry: 'Empresa genérica',
  tutorialId: 'tutorial_02',
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
  voiceAudioUrl: null,
  renderStatus: 'idle',
  renderProgress: 0,
};

