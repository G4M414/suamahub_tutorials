import { Course } from './types';

export const IKIGAI_COURSE: Course = {
  id: 'ikigai_emprender',
  courseName: 'Ikigai para emprender con propósito',
  slug: 'ikigai_emprender',
  description: 'Descubrí lo que te mueve. Reconocé lo que podés aportar. Encontrá dónde generar valor.',
  estimatedDuration: '60–90 minutos',
  level: 'introductorio',
  identity: {
    logoUrl: '/logo-suama.jpg',
    colors: {
      primary: '#00998b',
      secondary: '#025268',
      accent: '#c6c19d',
      background: '#ffffff',
      text: '#2f2722',
    },
    fontFamily: 'inter',
    brandName: 'SUAMA HUB',
    brandTagline: 'FORMACIÓN · SERVICIOS · DATOS',
    websiteUrl: 'www.suamahub.com',
  },
  exam: {
    title: 'Examen Final — Ikigai para emprender',
    passingScore: 2,
    totalQuestions: 3,
    questions: [
      {
        id: 'q_01',
        question: '¿Cuál es el principal objetivo de utilizar el Ikigai dentro de un proceso de desarrollo emprendedor?',
        options: [
          'Encontrar automáticamente un negocio exitoso.',
          'Identificar conexiones entre propósito, capacidades, necesidades y oportunidades económicas.',
          'Definir exclusivamente el precio de un producto.',
          'Reemplazar la validación del mercado.',
        ],
        correctIndex: 1,
        explanation: 'El Ikigai funciona como un marco exploratorio que cruza cuatro dimensiones para formular hipótesis de valor antes de invertir tiempo o capital.',
      },
      {
        id: 'q_02',
        question: 'Una persona disfruta cocinar, tiene experiencia en alimentación saludable, detecta que muchas personas necesitan opciones prácticas y descubre que podrían pagarle por viandas saludables. ¿Qué está haciendo al aplicar el Ikigai?',
        options: [
          'Relacionando las cuatro dimensiones para detectar una posible oportunidad emprendedora.',
          'Definiendo únicamente una estrategia de comunicación.',
          'Validando definitivamente un modelo de negocio.',
          'Determinando solamente una actividad que le gusta realizar.',
        ],
        correctIndex: 0,
        explanation: 'Está conectando lo que ama, lo que sabe hacer, lo que el entorno necesita y por lo que pueden pagarle.',
      },
      {
        id: 'q_03',
        question: 'Después de identificar una posible idea a partir del Ikigai, ¿cuál debería ser un siguiente paso adecuado en el proceso emprendedor?',
        options: [
          'Desarrollar inmediatamente todos los productos y servicios.',
          'Validar la necesidad, el cliente y la propuesta de valor.',
          'Elegir definitivamente el nombre de la empresa.',
          'Crear primero toda la identidad visual de la marca.',
        ],
        correctIndex: 1,
        explanation: 'Una oportunidad surgida del Ikigai es una hipótesis; el paso inmediato es contrastarla con la realidad hablando con clientes y evaluando el problema.',
      },
    ],
  },
  modules: [
    // ── MÓDULO 00 — BIENVENIDA ───────────────────────────────────────────────
    {
      id: 'module_00',
      type: 'intro',
      title: 'Bienvenida',
      objective: 'Presentar el curso y contextualizar al alumno sobre el recorrido de aprendizaje.',
      active: true,
      videoScript: `Bienvenido al curso Ikigai para emprender con propósito.

Cuando pensamos en emprender, muchas veces creemos que todo comienza con una gran idea.

Pero antes de preguntarnos qué negocio podemos crear, hay preguntas más importantes:

¿Qué nos interesa realmente? ¿Qué sabemos hacer? ¿Qué podemos aportar? ¿Qué problemas podemos ayudar a resolver? ¿Y cómo podemos transformar ese valor en una actividad sostenible?

El Ikigai nos propone justamente explorar esas conexiones.

Durante este curso vas a recorrer tres etapas.

Primero, vas a mirar hacia adentro para reconocer intereses, capacidades y experiencias.

Después, vas a aprender a conectar esa información con necesidades y oportunidades.

Y finalmente, vas a transformar esas conexiones en una primera hipótesis emprendedora que puedas comenzar a validar.

No buscamos encontrar una respuesta definitiva.

Buscamos construir una dirección.

Porque emprender no significa tener todo resuelto antes de empezar. Significa tener una hipótesis, dar un primer paso y aprender del camino.`,
      slides: [
        {
          id: 'slide_00_01',
          title: 'Portada del curso',
          content: 'IKIGAI PARA EMPRENDER CON PROPÓSITO',
          bulletPoints: [
            'Descubrí lo que te mueve.',
            'Reconocé lo que podés aportar.',
            'Encontrá dónde generar valor.',
          ],
        },
        {
          id: 'slide_00_02',
          title: 'Objetivos del curso',
          content: '¿Qué vas a aprender?',
          bulletPoints: [
            'Comprender el concepto de Ikigai.',
            'Identificar tus principales intereses y motivaciones.',
            'Reconocer conocimientos, habilidades y experiencias.',
            'Detectar problemas que pueden convertirse en oportunidades.',
            'Conectar tus capacidades con posibilidades de generación de valor.',
            'Formular una primera hipótesis emprendedora.',
            'Identificar qué aspectos de esa idea necesitás validar.',
            'Definir un primer paso concreto para avanzar.',
          ],
        },
      ],
      media: {},
      downloadableMaterials: [],
      activities: [],
    },

    // ── MÓDULO 01 — EMPEZAR POR VOS ──────────────────────────────────────────
    {
      id: 'module_01',
      type: 'content',
      title: 'Módulo 1 — Empezar por vos',
      objective: 'Reconocer intereses, capacidades, experiencias y motivaciones personales que pueden convertirse en recursos para un proyecto emprendedor.',
      active: true,
      videoScript: `Antes de preguntarte qué negocio crear, preguntate qué querés construir.

El Ikigai puede utilizarse como una herramienta de exploración que nos ayuda a conectar cuatro dimensiones.

La primera es Lo que amo: tus intereses, pasiones y actividades que te generan energía.

La segunda es Lo que sé hacer: tus conocimientos, habilidades, talentos y experiencias. Una capacidad no tiene que venir necesariamente de una carrera o título. Muchas veces nuestra experiencia cotidiana también construye capacidades valiosas.

La tercera es Lo que el mundo necesita: los problemas, necesidades o demandas que podés ayudar a resolver.

La cuarta es Por lo que pueden pagarme: la dimensión económica. Las oportunidades concretas de generar valor.

Y acá está el punto clave: no buscamos simplemente descubrir qué me gusta. Buscamos encontrar posibles conexiones entre aquello que me interesa, aquello que sé hacer, las necesidades que existen y las oportunidades económicas que pueden surgir.

Por eso, en este primer módulo, el objetivo no es encontrar tu emprendimiento. El objetivo es reunir información auténtica sobre vos.

Cuanto más honestas y detalladas sean tus respuestas, más útil será el mapa que vas a construir.

Tu primer paso emprendedor es conocerte mejor.`,
      slides: [
        {
          id: 'slide_01_01',
          title: 'Módulo 1 — Portada',
          content: 'MÓDULO 1 — EMPEZAR POR VOS',
          bulletPoints: ['Antes de preguntarte qué negocio crear, preguntate qué querés construir.'],
        },
        {
          id: 'slide_01_02',
          title: '¿Qué tiene que ver el Ikigai con emprender?',
          content: 'Emprender no siempre comienza con una idea. Muchas veces comienza con una pregunta:',
          bulletPoints: ['¿Qué quiero construir y por qué quiero hacerlo?'],
        },
        {
          id: 'slide_01_03',
          title: '¿Qué es Ikigai?',
          content: 'El Ikigai puede utilizarse como una herramienta de exploración que permite conectar cuatro dimensiones:',
          bulletPoints: [
            'LO QUE AMO',
            'LO QUE SÉ HACER',
            'LO QUE EL MUNDO NECESITA',
            'POR LO QUE PUEDEN PAGARME',
          ],
        },
        {
          id: 'slide_01_04',
          title: '01 — Lo que amo',
          content: 'Tus intereses, pasiones y actividades que te generan energía.',
          bulletPoints: [
            '¿Qué disfruto hacer?',
            '¿Qué temas me interesan?',
            '¿Qué podría investigar durante horas?',
            '¿Qué hago aunque nadie me lo pida?',
          ],
        },
        {
          id: 'slide_01_05',
          title: '02 — Lo que sé hacer',
          content: 'Tus conocimientos, habilidades, talentos y experiencias.',
          bulletPoints: [
            '¿Qué hago especialmente bien?',
            '¿Qué aprendí trabajando?',
            '¿Qué problemas sé resolver?',
            '¿Qué experiencia podría ser útil para otros?',
          ],
        },
        {
          id: 'slide_01_06',
          title: '03 — Lo que el mundo necesita',
          content: 'Problemas, necesidades o demandas que podés ayudar a resolver.',
          bulletPoints: [
            '¿Qué problemas observo?',
            '¿Qué necesidades detecto?',
            '¿Qué podría hacerse mejor?',
            '¿Qué situación me gustaría ayudar a transformar?',
          ],
        },
        {
          id: 'slide_01_07',
          title: '04 — Por lo que pueden pagarme',
          content: 'La dimensión económica.',
          bulletPoints: [
            '¿Qué conocimiento tiene valor?',
            '¿Qué servicio podría ofrecer?',
            '¿Qué producto podría desarrollar?',
            '¿Quién podría pagar por una solución?',
          ],
        },
        {
          id: 'slide_01_08',
          title: 'Una primera idea',
          content: 'No busques todavía tu emprendimiento.',
          bulletPoints: [
            'Buscá información sobre vos.',
            'Cuanto más auténticas sean tus respuestas, más útil será el mapa que vas a construir.',
          ],
        },
        {
          id: 'slide_01_09',
          title: 'Ahora te toca a vos',
          content: 'Completá la Guía de Autoconocimiento.',
          bulletPoints: ['Seleccioná después 3 respuestas principales de cada dimensión.'],
        },
      ],
      media: {},
      downloadableMaterials: [
        {
          id: 'mat_01_guia',
          title: 'Guía de Autoconocimiento — Mi punto de partida',
          description: 'Preguntas y ejercicios para explorar con profundidad las cuatro dimensiones del Ikigai.',
          sections: [
            {
              title: 'Dimensión 1: Lo que amo',
              items: [
                '¿Qué actividades disfruto especialmente hacer?',
                '¿Qué temas podría investigar o leer durante horas sin cansarme?',
                '¿Qué cosas hago con entusiasmo aunque nadie me las pida?',
                '¿Qué actividades me recargan de energía cuando las realizo?',
              ],
            },
            {
              title: 'Dimensión 2: Lo que sé hacer',
              items: [
                '¿Qué habilidades o tareas realizo con naturalidad y solvencia?',
                '¿Qué conocimientos prácticos adquirí trabajando, estudiando o en la vida cotidiana?',
                '¿Qué tipo de problemas suelen pedirme amigos, colegas o familiares que resuelva?',
                '¿Qué experiencia concreta mía podría resultar de gran ayuda para otros?',
              ],
            },
            {
              title: 'Dimensión 3: Lo que el mundo necesita',
              items: [
                '¿Qué problemas cotidianos o laborales observo en mi entorno?',
                '¿Qué necesidades no resueltas o mal atendidas detecto a mi alrededor?',
                '¿Qué procesos, productos o servicios podrían hacerse de una forma mucho más eficiente o humana?',
                '¿Qué situación me gustaría transformar activamente para generar un impacto positivo?',
              ],
            },
            {
              title: 'Dimensión 4: Por lo que pueden pagarme',
              items: [
                '¿Qué conocimientos, talentos o habilidades mías tienen valor económico real en el mercado?',
                '¿Qué servicios específicos podría ofrecer a personas o empresas?',
                '¿Qué productos o herramientas prácticas podría diseñar y comercializar?',
                '¿Quiénes son esas personas o negocios que estarían dispuestos a pagar por una solución así?',
              ],
            },
            {
              title: 'Ejercicio de Síntesis',
              items: [
                'Releé todas tus respuestas con calma y subrayá las que sientas más auténticas.',
                'Seleccioná exactamente 3 respuestas clave de cada una de las 4 dimensiones.',
                'Guardá este documento: será el insumo fundamental para el Módulo 2.',
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'act_01',
          title: 'Mi punto de partida',
          description: 'Completá la Guía de Autoconocimiento con respuestas honestas y detalladas. Luego seleccioná las 3 respuestas más significativas de cada dimensión.',
          steps: [
            'Descargá o abrí la Guía de Autoconocimiento.',
            'Respondé las 4 preguntas de cada dimensión (Lo que amo / Lo que sé hacer / Lo que el mundo necesita / Por lo que pueden pagarme).',
            'Tomá tu tiempo. No hay respuestas correctas o incorrectas.',
            'Seleccioná las 3 respuestas más auténticas de cada dimensión.',
            'Guardá esta guía: la vas a usar en el próximo módulo.',
          ],
        },
      ],
    },

    // ── MÓDULO 02 — ENCONTRAR LAS CONEXIONES ──────────────────────────────────
    {
      id: 'module_02',
      type: 'content',
      title: 'Módulo 2 — Encontrar las conexiones',
      objective: 'Aprender a relacionar las cuatro dimensiones del Ikigai para detectar posibles oportunidades emprendedoras.',
      active: true,
      videoScript: `El valor del Ikigai no está en completar cuatro listas. Está en descubrir qué sucede cuando las conectás.

Completar cuatro listas es apenas el comienzo. El verdadero ejercicio consiste en encontrar relaciones entre ellas.

Vamos a pensar en cuatro preguntas emprendedoras.

¿Qué me mueve? Lo que amo.

¿Qué puedo aportar? Lo que sé hacer.

¿Qué problema puedo resolver? Lo que el mundo necesita.

¿Cómo puedo generar valor? Por lo que pueden pagarme.

Cuando estas cuatro respuestas convergen, aparecen posibilidades.

Veamos un ejemplo concreto con Lucas.

Lucas ama cocinar y experimentar con alimentos. Sabe hacer cocina saludable, fotografía y creación de contenido. Detecta la necesidad de opciones prácticas de alimentación saludable. Y puede ofrecer viandas, contenidos gastronómicos o talleres.

¿Qué oportunidades aparecen? Viandas saludables. Contenido gastronómico. Talleres de cocina. Un proyecto que combine producto, contenido y comunidad.

El Ikigai no decide por vos. Te ayuda a descubrir posibilidades que antes estaban desconectadas.

Antes de avanzar con cualquier idea, vale hacerse cinco preguntas: ¿Me interesa realmente? ¿Tengo capacidades para hacerlo? ¿Resuelve una necesidad? ¿Hay alguien dispuesto a pagar? ¿Tiene sentido para mi vida?

Y acá hay una pregunta muy importante, que muchas veces se omite: ¿Este proyecto encaja con la vida que quiero construir?

Porque una oportunidad puede ser rentable y, sin embargo, no ser adecuada para vos.

En este módulo transformaste respuestas personales en posibles oportunidades emprendedoras.

En el próximo módulo vas a convertir una posibilidad en una hipótesis concreta y vas a aprender qué significa validarla.`,
      slides: [
        {
          id: 'slide_02_01',
          title: 'Módulo 2 — Portada',
          content: 'MÓDULO 2 — ENCONTRAR LAS CONEXIONES',
          bulletPoints: ['El valor del Ikigai no está en completar cuatro listas. Está en descubrir qué sucede cuando las conectás.'],
        },
        {
          id: 'slide_02_02',
          title: 'Las cuatro preguntas emprendedoras',
          content: 'Cuatro preguntas que guían la exploración:',
          bulletPoints: [
            '¿Qué me mueve? → Lo que amo.',
            '¿Qué puedo aportar? → Lo que sé hacer.',
            '¿Qué problema puedo resolver? → Lo que el mundo necesita.',
            '¿Cómo puedo generar valor? → Por lo que pueden pagarme.',
          ],
        },
        {
          id: 'slide_02_03',
          title: 'Cuando las respuestas se conectan...',
          content: 'Aparecen posibilidades. No necesariamente una única respuesta.',
          bulletPoints: ['Aparecen oportunidades para explorar.'],
        },
        {
          id: 'slide_02_04',
          title: 'Caso Lucas',
          content: 'Conozcamos a Lucas:',
          bulletPoints: [
            'Le gusta: Cocinar y experimentar con alimentos.',
            'Sabe hacer: Cocina saludable, fotografía y creación de contenido.',
            'Detecta: Necesidad de opciones prácticas de alimentación saludable.',
            'Puede ofrecer: Viandas, contenidos gastronómicos o talleres.',
          ],
        },
        {
          id: 'slide_02_05',
          title: '¿Qué oportunidades aparecen?',
          content: 'A partir de las respuestas de Lucas:',
          bulletPoints: [
            '01 Viandas saludables',
            '02 Contenido gastronómico',
            '03 Talleres de cocina',
            '04 Producto + contenido + comunidad',
          ],
        },
        {
          id: 'slide_02_06',
          title: 'Una idea importante',
          content: 'El Ikigai no decide por vos.',
          bulletPoints: ['Te ayuda a descubrir posibilidades que antes estaban desconectadas.'],
        },
        {
          id: 'slide_02_07',
          title: 'El filtro emprendedor',
          content: 'Antes de avanzar con una idea, preguntate:',
          bulletPoints: [
            '¿Me interesa realmente?',
            '¿Tengo capacidades para hacerlo?',
            '¿Resuelve una necesidad?',
            '¿Hay alguien dispuesto a pagar?',
            '¿Tiene sentido para mi vida?',
          ],
        },
        {
          id: 'slide_02_08',
          title: 'La quinta pregunta',
          content: 'Una oportunidad puede ser rentable y, sin embargo, no ser adecuada para vos. Por eso preguntate:',
          bulletPoints: ['¿Este proyecto encaja con la vida que quiero construir?'],
        },
        {
          id: 'slide_02_09',
          title: 'Ahora te toca a vos',
          content: 'Utilizá tus respuestas del módulo anterior.',
          bulletPoints: ['Buscá las conexiones.'],
        },
      ],
      media: {},
      downloadableMaterials: [
        {
          id: 'mat_02_caso',
          title: 'Caso Práctico — Lucas',
          description: 'Analizá el caso de Lucas para practicar la identificación de conexiones antes de trabajar con tu propio mapa.',
          sections: [
            {
              title: 'Contexto del caso',
              items: [
                'Lucas ama cocinar, investigar recetas y la nutrición balanceada.',
                'Tiene habilidades en cocina gourmet, fotografía móvil y manejo de redes.',
                'Detecta que profesionales ocupados comen mal por falta de tiempo.',
                'Podría monetizar con viandas semanales, cursos online o recetarios pagos.',
              ],
            },
            {
              title: 'Consignas de análisis',
              items: [
                '1. Identificá claramente las cuatro dimensiones del Ikigai en el caso de Lucas.',
                '2. Marcá las principales conexiones que encuentres entre sus gustos, habilidades y el mercado.',
                '3. Proponé tres posibles oportunidades de negocio viables para él.',
                '4. Elegí la que te parezca más sólida y explicá tu criterio.',
              ],
            },
          ],
        },
        {
          id: 'mat_02_mapa',
          title: 'Mi Mapa de Oportunidades',
          description: 'Plantilla de trabajo para cruzar tus cuatro dimensiones e identificar oportunidades concretas.',
          sections: [
            {
              title: 'Cruce de Dimensiones',
              items: [
                'LO QUE AMO: (copiá tus 3 respuestas seleccionadas del Módulo 1)',
                'LO QUE SÉ HACER: (copiá tus 3 respuestas seleccionadas del Módulo 1)',
                'LO QUE EL MUNDO NECESITA: (copiá tus 3 respuestas seleccionadas del Módulo 1)',
                'POR LO QUE PUEDEN PAGARME: (copiá tus 3 respuestas seleccionadas del Módulo 1)',
              ],
            },
            {
              title: 'Detección de Conexiones',
              items: [
                '¿Qué patrones o intersecciones descubrís al mirar las cuatro dimensiones juntas?',
                '¿Qué 2 o 3 oportunidades emprendedoras emergen de este cruce?',
                '¿Cuál de estas oportunidades te despierta mayor interés y entusiasmo para profundizar?',
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'act_02_caso',
          title: 'Análisis del caso Lucas',
          description: 'Practicá la identificación de conexiones analizando el caso de Lucas antes de trabajar con tu propia información.',
          steps: [
            'Abrí el material del Caso Práctico — Lucas.',
            'Identificá las cuatro dimensiones del Ikigai en el caso.',
            'Marcá las conexiones entre dimensiones.',
            'Proponé tres oportunidades posibles.',
            'Elegí la que te parece más interesante y explicá por qué.',
          ],
        },
        {
          id: 'act_02_mapa',
          title: 'Mi mapa de oportunidades',
          description: 'Completá tu propio mapa cruzando las respuestas del módulo anterior y buscando conexiones.',
          steps: [
            'Completá la plantilla Mi Mapa de Oportunidades.',
            'Volcá tus 3 respuestas clave por dimensión.',
            'Buscá relaciones e intersecciones entre ellas.',
            'Anotá las oportunidades emergentes y seleccioná tu favorita.',
          ],
        },
      ],
    },

    // ── MÓDULO 03 — CONVERTIR EL IKIGAI EN ACCIÓN ─────────────────────────────
    {
      id: 'module_03',
      type: 'content',
      title: 'Módulo 3 — Convertir el Ikigai en acción',
      objective: 'Transformar las conexiones identificadas en una primera hipótesis emprendedora y definir qué aspectos deberían validarse antes de avanzar.',
      active: true,
      videoScript: `Encontrar una posible oportunidad no significa tener un negocio. Ahora necesitamos convertir esa oportunidad en una hipótesis emprendedora.

Una oportunidad empieza a tomar forma cuando podemos explicar qué problema resolvemos, para quién y qué valor aportamos.

Para eso, usamos una fórmula simple.

Quiero ayudar a... las personas a las que apunto. Que tienen... el problema o necesidad que identifico. Mediante... la solución que propongo. Utilizando... mis capacidades concretas.

Por ejemplo: Quiero ayudar a pequeños emprendedores que tienen dificultades para organizar su administración, mediante un servicio de gestión y acompañamiento, utilizando mi experiencia en administración y organización de procesos.

Pero una idea no es todavía un negocio. Una idea necesita ser contrastada con la realidad.

Hay cinco preguntas clave: ¿Existe realmente el problema? ¿Quién lo tiene? ¿Cómo lo resuelve actualmente? ¿Mi solución aporta valor? ¿Alguien estaría dispuesto a pagar?

Y la buena noticia es que no necesitás desarrollar todo para empezar a comprobar si existe una oportunidad.

Podés hablar con potenciales clientes. Investigar necesidades. Analizar soluciones existentes. Probar una propuesta. Ofrecer una versión inicial.

El recorrido que hiciste en este curso puede resumirse así: Autoconocimiento → Conexiones → Oportunidad → Hipótesis → Validación → Acción.

El Ikigai no busca encontrar el emprendimiento perfecto. Busca ayudarte a tomar mejores decisiones sobre qué querés construir, qué podés aportar y qué valor podés generar.

No necesitás tener todo resuelto para empezar. Necesitás una dirección, una hipótesis y la disposición para aprender del camino.`,
      slides: [
        {
          id: 'slide_03_01',
          title: 'Módulo 3 — Portada',
          content: 'MÓDULO 3 — DE LA IDEA A LA ACCIÓN',
          bulletPoints: ['Una oportunidad empieza a tomar forma cuando podemos explicar qué problema resolvemos, para quién y qué valor aportamos.'],
        },
        {
          id: 'slide_03_02',
          title: 'Del Ikigai a una hipótesis',
          content: 'Completá esta fórmula:',
          bulletPoints: [
            'QUIERO AYUDAR A... [PERSONAS]',
            'QUE TIENEN... [PROBLEMA / NECESIDAD]',
            'MEDIANTE... [SOLUCIÓN]',
            'UTILIZANDO... [MIS CAPACIDADES]',
          ],
        },
        {
          id: 'slide_03_03',
          title: 'Ejemplo',
          content: 'Quiero ayudar a pequeños emprendedores que tienen dificultades para organizar su administración, mediante un servicio de gestión y acompañamiento, utilizando mi experiencia en administración y organización de procesos.',
        },
        {
          id: 'slide_03_04',
          title: 'Una idea no es todavía un negocio',
          content: 'Una idea necesita ser contrastada con la realidad. Preguntate:',
          bulletPoints: [
            '¿Existe realmente el problema?',
            '¿Quién lo tiene?',
            '¿Cómo lo resuelve actualmente?',
            '¿Mi solución aporta valor?',
            '¿Alguien estaría dispuesto a pagar?',
          ],
        },
        {
          id: 'slide_03_05',
          title: 'Validar antes de invertir',
          content: 'No necesitás desarrollar todo para empezar a comprobar una idea. Podés:',
          bulletPoints: [
            'Hablar con potenciales clientes.',
            'Investigar necesidades.',
            'Analizar soluciones existentes.',
            'Probar una propuesta.',
            'Ofrecer una versión inicial.',
          ],
        },
        {
          id: 'slide_03_06',
          title: 'El recorrido',
          content: 'El proceso completo:',
          bulletPoints: [
            'AUTOCONOCIMIENTO',
            '↓ CONEXIONES',
            '↓ OPORTUNIDAD',
            '↓ HIPÓTESIS',
            '↓ VALIDACIÓN',
            '↓ ACCIÓN',
          ],
        },
        {
          id: 'slide_03_07',
          title: 'El Ikigai no busca encontrar "el emprendimiento perfecto"',
          content: 'Busca ayudarte a tomar mejores decisiones sobre:',
          bulletPoints: [
            'qué querés construir,',
            'qué podés aportar',
            'y qué valor podés generar.',
          ],
        },
        {
          id: 'slide_03_08',
          title: 'Tu Brújula Emprendedora',
          content: 'Ahora vas a transformar todo lo trabajado en una primera dirección emprendedora.',
          bulletPoints: ['Completá la Actividad Final del curso.'],
        },
      ],
      media: {},
      downloadableMaterials: [
        {
          id: 'mat_03_validacion',
          title: 'Guía de Validación de mi Idea',
          description: 'Herramienta para evaluar el potencial real de tu hipótesis antes de invertir recursos.',
          sections: [
            {
              title: '1. El Problema',
              items: [
                '¿Qué dolor o problema concreto busco solucionar?',
                '¿A quiénes afecta directamente y con qué frecuencia?',
                '¿Cómo están resolviendo hoy este problema si no existe mi propuesta?',
              ],
            },
            {
              title: '2. El Cliente',
              items: [
                '¿Quién es exactamente mi cliente ideal (edad, rol, intereses)?',
                '¿Dónde se informa, trabaja o pasa su tiempo?',
                '¿Qué frustraciones específicas tiene hoy?',
              ],
            },
            {
              title: '3. La Solución y Propuesta de Valor',
              items: [
                '¿Cuál es mi oferta puntual (servicio, producto, asesoría)?',
                '¿Qué beneficio tangible o ahorro genera en la vida del cliente?',
                '¿Por qué elegirían mi alternativa frente a otras existentes?',
              ],
            },
            {
              title: '4. Modelo y Viabilidad',
              items: [
                '¿Quién es el pagador final y qué esquema de precios tiene sentido?',
                '¿Por qué canal directo o digital puedo contactar a mis primeros 5 clientes?',
                '¿Cuál es la prueba piloto más rápida que puedo lanzar esta semana?',
              ],
            },
          ],
        },
        {
          id: 'mat_03_brujula',
          title: 'Mi Brújula Emprendedora — Actividad Integradora',
          description: 'Documento síntesis del curso que consolida tu propósito, hipótesis y plan de acción inicial.',
          sections: [
            {
              title: '10 Dimensiones de la Brújula',
              items: [
                '01. Lo que me apasiona: Mis principales intereses y motivaciones motoras.',
                '02. Mis capacidades clave: Mis conocimientos y talentos diferenciales.',
                '03. El problema que abordo: La necesidad específica detectada en el entorno.',
                '04. Mi cliente objetivo: Las personas u organizaciones a quienes ayudo.',
                '05. Mi propuesta de solución: El producto/servicio concreto que ofrezco.',
                '06. Generación de valor: Por qué están dispuestos a pagar por esto.',
                '07. Qué necesito aprender: Las brechas técnicas o comerciales a fortalecer.',
                '08. Qué debo validar primero: El supuesto más riesgoso que debo verificar.',
                '09. Mi primer paso concreto: La acción realizable en las próximas 48 horas.',
                '10. Mi declaración de propósito: Qué quiero construir y por qué me importa.',
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'act_03_hipotesis',
          title: 'Mi hipótesis emprendedora',
          description: 'Formulá tu primera hipótesis emprendedora usando la fórmula del módulo.',
          steps: [
            'Usá la fórmula: Quiero ayudar a [PERSONAS] que tienen [PROBLEMA/NECESIDAD], mediante [SOLUCIÓN], utilizando [MIS CAPACIDADES].',
            'Escribí tu hipótesis con la mayor precisión posible.',
            'Identificá las cinco preguntas de validación para tu hipótesis.',
            'Completá la Guía de Validación de mi Idea.',
          ],
        },
        {
          id: 'act_03_brujula',
          title: 'Mi Brújula Emprendedora — Actividad Integradora',
          description: 'La actividad final del curso. Integrá todo lo trabajado en una primera dirección emprendedora concreta.',
          steps: [
            'Descargá o completá la plantilla Mi Brújula Emprendedora.',
            'Respondé los 10 puntos clave de consolidación.',
            'Revisá que tu primer paso concreto sea realista para ejecutar esta misma semana.',
            '¡Listo! Ya tenés un mapa y dirección fundamentada para emprender.',
          ],
        },
      ],
    },

    // ── MÓDULO CIERRE — CIERRE DEL CURSO ──────────────────────────────────────
    {
      id: 'module_close',
      type: 'closing',
      title: 'Cierre del curso',
      objective: 'Cerrar el recorrido de aprendizaje y motivar al alumno a dar su primer paso concreto.',
      active: true,
      videoScript: `Llegaste al final del recorrido.

Durante este curso utilizaste el Ikigai para mirar hacia adentro, reconocer tus capacidades, identificar necesidades y comenzar a encontrar conexiones que pueden convertirse en oportunidades.

Pero hay algo importante que recordar: el Ikigai no es una fórmula que determina qué tenés que hacer con tu vida.

Es una herramienta para hacer mejores preguntas.

Una idea puede cambiar. El mercado puede cambiar. Tus capacidades pueden crecer. Y vos también podés cambiar.

Por eso, no necesitás tener todo resuelto para empezar.

Necesitás una dirección.

Una hipótesis.

Un primer paso.

Y la disposición para aprender del camino.

Tu próximo desafío es simple: tomá tu Brújula Emprendedora y convertí tu primera hipótesis en una conversación con la realidad.

Porque una idea empieza a convertirse en proyecto cuando dejamos de imaginarla y comenzamos a validarla.`,
      slides: [
        {
          id: 'slide_close_01',
          title: 'Cierre — Portada',
          content: 'LLEGASTE AL FINAL DEL RECORRIDO.',
          bulletPoints: ['El Ikigai no es una fórmula. Es una herramienta para hacer mejores preguntas.'],
        },
        {
          id: 'slide_close_02',
          title: 'Tu próximo paso',
          content: 'No necesitás tener todo resuelto para empezar. Necesitás:',
          bulletPoints: [
            'Una dirección.',
            'Una hipótesis.',
            'Un primer paso.',
            'La disposición para aprender del camino.',
          ],
        },
        {
          id: 'slide_close_03',
          title: 'Tu desafío',
          content: 'Tomá tu Brújula Emprendedora y convertí tu primera hipótesis en una conversación con la realidad.',
          bulletPoints: ['Una idea empieza a convertirse en proyecto cuando dejamos de imaginarla y comenzamos a validarla.'],
        },
      ],
      media: {},
      downloadableMaterials: [],
      activities: [],
    },
  ],
};

export const COURSE_DATA: Record<string, Course> = {
  ikigai_emprender: IKIGAI_COURSE,
};
