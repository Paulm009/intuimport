<?php

namespace Database\Seeders;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\LessonProgress;
use App\Models\LibraryResource;
use App\Models\Meeting;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\Recording;
use App\Models\Reply;
use App\Models\Suggestion;
use App\Models\Tariff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedCatalog();

        User::create([
            'name' => 'Administrador Fulcomex',
            'email' => 'admin@intuimport.bo',
            'password' => Hash::make('password'),
            'job_role' => 'Administrador',
            'city' => 'Bolivia',
            'membership_plan' => 'Staff',
            'is_admin' => true,
            'status' => 'active',
        ]);

        $user = User::create([
            'name' => 'Usuario Demo',
            'email' => 'demo@intuimport.bo',
            'password' => Hash::make('password'),
            'ci' => '0000000 CB',
            'phone' => '+591 70000000',
            'job_role' => 'Importador / Emprendedor',
            'city' => 'Cochabamba · Bolivia',
            'interests' => 'Electrónica, Iluminación LED, Maquinaria Ligera, Hogar',
            'membership_plan' => 'Plan Importador Anual',
        ]);

        $this->seedUserData($user);

        $communityUser = User::create([
            'name' => 'Carlos Mendoza',
            'email' => 'carlos@intuimport.bo',
            'password' => Hash::make('password'),
            'city' => 'La Paz · Bolivia',
            'job_role' => 'Importador',
        ]);

        $this->seedCommunity($user, $communityUser);
    }

    private function seedCatalog(): void
    {
        $courses = [
            [
                'title' => 'Importación Marítima de China paso a paso',
                'icon' => '🚢',
                'modules' => 6,
                'lessons' => [
                    '1. Selección de Incoterms (EXW, FOB, CIF)',
                    '2. Reserva de espacio LCL y FCL con Forwarder',
                    '3. Documentos de embarque: Bill of Lading, Packing List e Invoice',
                    '4. Tránsito por puerto (Iquique / Arica) y nacionalización',
                ],
            ],
            [
                'title' => 'Importación Aérea y Courier Express desde China',
                'icon' => '✈️',
                'modules' => 4,
                'lessons' => [
                    '1. Cálculo de peso volumétrico vs. peso bruto real',
                    '2. Límites de valor y peso para despacho simplificado',
                    '3. Consolidación de muestras de distintos proveedores',
                ],
            ],
            [
                'title' => 'Búsqueda de Productos Ganadores y Proveedores en 1688 / Alibaba',
                'icon' => '🔎',
                'modules' => 5,
                'lessons' => [
                    '1. Verificación de licencias comerciales y antigüedad de fábrica',
                    '2. Uso de agentes de compra e inspección de calidad en origen',
                    '3. Plantillas de solicitud de cotización (RFQ)',
                ],
            ],
            [
                'title' => 'Pagos Internacionales, Bancos y Criptomonedas (USDT)',
                'icon' => '💳',
                'modules' => 4,
                'lessons' => [
                    '1. Transferencias SWIFT bancarias y comisiones de corresponsalía',
                    '2. Trade Assurance en Alibaba y respaldo contractual',
                    '3. Liquidación con proveedores y agentes mediante USDT',
                ],
            ],
            [
                'title' => 'Comercialización y Escalado en Facebook Marketplace y E-commerce',
                'icon' => '📈',
                'modules' => 4,
                'lessons' => [
                    '1. Estructura de precios mayorista vs. minorista',
                    '2. Fotografía de producto y rotación rápida de stock',
                ],
            ],
        ];

        foreach ($courses as $position => $courseData) {
            $course = Course::create([
                'title' => $courseData['title'],
                'icon' => $courseData['icon'],
                'badge' => 'Incluido',
                'modules' => $courseData['modules'],
                'position' => $position,
            ]);

            foreach ($courseData['lessons'] as $lessonPosition => $lessonTitle) {
                $course->lessons()->create([
                    'title' => $lessonTitle,
                    'position' => $lessonPosition,
                ]);
            }
        }

        $recordings = [
            ['title' => 'Análisis en vivo de costos marítimos LCL por Iquique', 'category' => 'CLASES', 'duration' => '115 min', 'recorded_on' => '2026-11-05', 'summary' => 'Desglose completo de flete marítimo, gastos portuarios, seguro del 2% y liquidación de GA/IVA.'],
            ['title' => 'Verificación de proveedores en Alibaba y contratos de compra', 'category' => 'CLASES', 'duration' => '98 min', 'recorded_on' => '2026-10-29', 'summary' => 'Revisión de cláusulas de penalidad por retraso, control de calidad pre-embarque y pago seguro.'],
            ['title' => 'Taller práctico de cubicaje CBM y armado de Packing List', 'category' => 'TALLERES', 'duration' => '84 min', 'recorded_on' => '2026-10-22', 'summary' => 'Optimización de cajas master para contenedores de 20 pies y carga consolidada.'],
        ];

        foreach ($recordings as $recording) {
            Recording::create($recording);
        }

        $tariffs = [
            ['code' => '8539.52.00.00', 'description' => 'Lámparas y tubos de diodos emisores de luz (LED)', 'ga' => 10, 'iva' => 14.94, 'requirement' => 'Sin permiso previo (Etiquetado eficiencia)'],
            ['code' => '8541.43.00.00', 'description' => 'Células fotovoltaicas ensambladas en módulos o paneles solares', 'ga' => 5, 'iva' => 14.94, 'requirement' => 'Incentivo energético — Libre de autorización previa'],
            ['code' => '8467.21.00.00', 'description' => 'Taladros de toda clase con motor eléctrico incorporado', 'ga' => 10, 'iva' => 14.94, 'requirement' => 'Factura comercial + Lista de empaque'],
            ['code' => '8517.13.00.00', 'description' => 'Teléfonos inteligentes (Smartphones) para redes celulares', 'ga' => 10, 'iva' => 14.94, 'requirement' => 'Homologación ATT según modelo'],
            ['code' => '9403.20.00.00', 'description' => 'Muebles de metal para uso doméstico o comercial', 'ga' => 20, 'iva' => 14.94, 'requirement' => 'Sin permiso previo'],
            ['code' => '8711.60.00.00', 'description' => 'Motocicletas y velocípedos propulsados con motor eléctrico', 'ga' => 10, 'iva' => 14.94, 'requirement' => 'Certificación IBMETRO / Año modelo vigente'],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::create($tariff);
        }

        $library = [
            ['title' => 'Checklist Operativo: Guía de Pasos para Importar de China a Bolivia', 'category' => 'Guía', 'content' => "1. Definición de partida arancelaria y tributos.\n2. Búsqueda y filtro de 3 a 5 fabricantes.\n3. Solicitud de Proforma Invoice con Incoterm FOB o EXW.\n4. Cálculo de liquidación previa (FOB + Flete + Seguro + GA + IVA).\n5. Pago e inspección pre-embarque.\n6. Emisión de B/L y nacionalización con agencia despachante."],
            ['title' => 'Glosario Completo de Comercio Exterior e Incoterms 2020', 'category' => 'Glosarios', 'content' => 'Incluye definiciones prácticas de EXW, FCA, FOB, CFR, CIF, DAP, DDP, Bill of Lading (B/L), Air Waybill (AWB), Manifiesto Internacional de Carga (MIC/DTA), Gravamen Arancelario (GA) y Valor CIF Frontera.'],
            ['title' => 'Plantilla de Contrato de Compraventa Internacional (Bilingüe ES/EN)', 'category' => 'Contrato', 'content' => 'Modelo estándar con especificaciones técnicas de calidad, tolerancia de defectos, fecha límite de embarque, puerto de salida y resolución de controversias.'],
            ['title' => 'Manual de Uso de Calculadora de Costos y Prorrateo Aduanero', 'category' => 'Manual', 'content' => 'Explicación matemática del prorrateo por valor FOB para múltiples ítems dentro de un mismo embarque consolidado.'],
            ['title' => 'Plantilla de Solicitud de Cotización (RFQ) para Fábricas', 'category' => 'Plantilla', 'content' => 'Formato listo para enviar por Alibaba, WeChat o correo solicitando MOQ, HS Code, dimensiones de caja master, peso bruto y tiempo de producción.'],
        ];

        foreach ($library as $resource) {
            LibraryResource::create($resource);
        }

        $suggestions = [
            ['name' => 'Proyector Portátil Smart WiFi Full HD', 'fob' => 34.00, 'ga' => 10, 'moq' => 30, 'description' => 'Alta rotación en e-commerce; caja compacta ideal para aéreo o LCL.'],
            ['name' => 'Luminaria Solar Urbana All-in-One 300W', 'fob' => 18.50, 'ga' => 10, 'moq' => 50, 'description' => 'Excelente margen mayorista para ferreterías y proyectos.'],
            ['name' => 'Selladora al Vacío Industrial de Mesa', 'fob' => 85.00, 'ga' => 5, 'moq' => 10, 'description' => 'Baja tasa arancelaria como maquinaria para sector gastronómico.'],
        ];

        foreach ($suggestions as $suggestion) {
            Suggestion::create($suggestion);
        }

        $meetings = [
            ['day' => 'Martes', 'time' => '20:00 - 21:30', 'title' => 'Revisión de Cotizaciones y Partidas Arancelarias en Vivo', 'modality' => 'Zoom en vivo'],
            ['day' => 'Jueves', 'time' => '20:00 - 21:30', 'title' => 'Negociación con Fábricas en Alibaba y 1688', 'modality' => 'Clase práctica'],
            ['day' => 'Sábado', 'time' => '10:00 - 11:30', 'title' => 'Taller de Liquidación Aduanera y Despacho LCL/FCL', 'modality' => 'Taller técnico'],
        ];

        foreach ($meetings as $meeting) {
            Meeting::create($meeting);
        }
    }

    private function seedUserData(User $user): void
    {
        $suppliers = [
            ['name' => 'Zhongshan Bright Solar Co.', 'city' => 'China · Zhongshan', 'sells' => 'Reflectores y Paneles Solares LED', 'port' => 'FOB Shenzhen', 'contact' => 'Lily Wang (+86 13922001100)', 'rating' => 5],
            ['name' => 'Yongkang Power Tools Ltd.', 'city' => 'China · Jinhua', 'sells' => 'Taladros, Amoladoras y Kits de Herramientas', 'port' => 'FOB Ningbo', 'contact' => 'David Zhou (+86 15800112233)', 'rating' => 4],
        ];

        foreach ($suppliers as $supplier) {
            $user->suppliers()->create($supplier);
        }

        $importOne = $user->imports()->create([
            'code' => 'IMP-001',
            'operation_date' => '2026-11-04',
            'name' => 'Consolidado Iluminación Solar LED',
            'supplier' => 'Zhongshan Bright Solar Co.',
            'ports' => 'Shenzhen → Iquique',
            'load_type' => 'LCL',
            'incoterm' => 'FOB',
            'status' => 'En proceso',
        ]);

        $importTwo = $user->imports()->create([
            'code' => 'IMP-002',
            'operation_date' => '2026-10-28',
            'name' => 'Herramientas Eléctricas Inalámbricas',
            'supplier' => 'Yongkang Power Tools Ltd.',
            'ports' => 'Ningbo → Arica',
            'load_type' => 'LCL',
            'incoterm' => 'FOB',
            'status' => 'Cotizando',
        ]);

        $user->products()->create([
            'import_id' => $importOne->id,
            'name' => 'Reflector Solar LED 200W con Panel',
            'import_ref' => 'IMP-001',
            'supplier' => 'Zhongshan Bright Solar Co.',
            'brand' => 'SolarMax',
            'qty' => 200,
            'price' => 11.50,
            'state' => 'importados',
        ]);

        $user->products()->create([
            'import_id' => $importTwo->id,
            'name' => 'Taladro Percutor Brushless 21V Maletín',
            'import_ref' => 'IMP-002',
            'supplier' => 'Yongkang Power Tools Ltd.',
            'brand' => 'ProTorque',
            'qty' => 120,
            'price' => 16.80,
            'state' => 'no-importados',
        ]);

        $contacts = [
            ['name' => 'Andes Cargo Logistics S.R.L.', 'role' => 'Agente de carga', 'phone' => '+591 70011223', 'email' => 'pricing@andescargo.bo', 'location' => 'La Paz / Santa Cruz'],
            ['name' => 'Agencia Despachante Aduana Sur', 'role' => 'Despachante de aduana', 'phone' => '+591 70044556', 'email' => 'despachos@aduanasur.bo', 'location' => 'Cochabamba / Arica'],
            ['name' => 'TransAltiplano Internacional', 'role' => 'Transporte', 'phone' => '+591 70088990', 'email' => 'flota@transaltiplano.bo', 'location' => 'Iquique → Oruro / CBBA'],
        ];

        foreach ($contacts as $contact) {
            $user->contacts()->create($contact);
        }

        $user->savedQuotes()->create([
            'name' => 'Consolidado Iluminación Solar Q4',
            'mode' => 'Marítima',
            'quote_date' => '2026-11-09',
            'cif_usd' => 5230.80,
            'total_usd' => 6845.20,
            'total_bob' => 47642.59,
        ]);

        $user->serviceRequests()->create([
            'type' => 'Revisión de Proforma e Incoterms',
            'status' => 'En revisión técnica',
        ]);

        $user->devices()->create(['name' => 'Chrome en Windows 11 (Sesión Actual)', 'location' => 'Cochabamba, BO', 'is_current' => true, 'last_active_at' => now()]);
        $user->devices()->create(['name' => 'Safari en iPhone', 'location' => 'Cochabamba, BO', 'is_current' => false, 'last_active_at' => now()->subDay()]);

        Certificate::create([
            'user_id' => $user->id,
            'title' => 'Certificado de Especialización en Importación China – Bolivia',
            'folio' => 'CERT-IMP-2026-0841',
            'issued_at' => '2026-11-01',
        ]);

        $completedLessons = Course::with('lessons')->get()
            ->flatMap(fn ($course) => $course->lessons)
            ->take(3);

        foreach ($completedLessons as $lesson) {
            LessonProgress::create([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'completed' => true,
            ]);
        }
    }

    private function seedCommunity(User $user, User $other): void
    {
        $postOne = Post::create([
            'user_id' => $other->id,
            'title' => 'Tiempo actual de desconsolidación LCL en puerto de Iquique',
            'body' => 'Hola colegas, ¿alguien desconsolidó carga LCL esta semana en Iquique? Mi naviera reporta arribo el viernes y quiero estimar cuántos días está tomando el despacho a Cochabamba.',
            'likes' => 8,
        ]);

        Reply::create([
            'post_id' => $postOne->id,
            'user_id' => $user->id,
            'body' => 'Actualmente está tomando entre 3 y 4 días hábiles desde la apertura del contenedor si la factura y lista de empaque están listas.',
        ]);

        $postTwo = Post::create([
            'user_id' => $user->id,
            'title' => 'Comparativa de flete marítimo Shenzhen vs. Ningbo',
            'body' => 'Comparto que al consolidar 4.2 CBM en Shenzhen obtuve una tarifa $45 menor en gastos locales de origen que saliendo por Ningbo.',
            'likes' => 12,
        ]);

        PostLike::create(['user_id' => $user->id, 'post_id' => $postTwo->id]);
    }
}
