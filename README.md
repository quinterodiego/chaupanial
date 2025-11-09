# Chaupanial 🍼

![Chaupanial Logo](https://via.placeholder.com/200x100/0ea5e9/white?text=Chaupanial)

**Tu compañero argentino en la crianza** - La primera PWA diseñada por padres argentinos, para padres argentinos.

## 🚀 Características principales

### 🆓 **Versión Gratuita (Siempre gratis)**

#### 📊 Seguimiento Básico
- ✅ Registro manual de actividades (comidas, sueño, pañales)
- ✅ Historial de últimos 30 días
- ✅ Un solo bebé por cuenta
- ✅ Recordatorios básicos (máximo 3 por día)
- ⚠️ Con publicidad discreta

#### 📅 Calendario y Vacunas
- ✅ Calendario de vacunas argentino oficial (solo visualización)
- ✅ Recordatorios de vacunas próximas (7 días antes)
- ⚠️ Sin exportación de calendario

#### 💬 Comunidad y Contenido
- ✅ Acceso a comunidad de padres (lectura y comentarios básicos)
- ✅ Tips diarios de crianza (contenido general)
- ✅ Foros públicos por temas
- ⚠️ Sin acceso a grupos premium

#### 📱 Funcionalidades Técnicas
- ✅ PWA instalable
- ✅ Funciona offline (modo básico)
- ✅ Sincronización en la nube
- ⚠️ Límite de 50 registros por mes

---

### 👑 **Versión Premium (Pago único: $4.999 ARS)**

#### ✨ **Todo lo de la versión gratuita +**

#### 📊 Seguimiento Avanzado
- 🚀 Registro rápido con widgets y atajos
- 🚀 Historial ilimitado (toda la vida del bebé)
- 🚀 Múltiples bebés en una cuenta (hasta 5)
- 🚀 Recordatorios ilimitados y personalizables
- 🚀 Gráficos y estadísticas avanzadas
- 🚀 Exportación de datos (CSV, PDF)
- 🚀 Búsqueda inteligente en historial

#### 📅 Calendario Premium
- 🚀 Calendario completo exportable (iCal, Google Calendar)
- 🚀 Recordatorios avanzados de vacunas (30 días antes)
- 🚀 Historial completo de vacunas aplicadas
- 🚀 Alertas personalizadas por tipo de vacuna
- 🚀 Integración con calendario del celular

#### 🩺 Consultas y Salud
- 🚀 **Consultas virtuales con pediatras argentinos certificados** (1 consulta incluida, luego descuentos del 20%)
- 🚀 Reportes médicos detallados (PDF profesional)
- 🚀 Gráficos de crecimiento (percentiles argentinos)
- 🚀 Historial médico completo exportable
- 🚀 Recordatorios de controles pediátricos
- 🚀 Base de datos de medicamentos aprobados en Argentina

#### 📚 Contenido Premium
- 🚀 Guías especializadas exclusivas:
  - "Primeros 100 días del bebé"
  - "Lactancia materna en Argentina"
  - "Alimentación complementaria paso a paso"
  - "Sueño seguro según AAP Argentina"
- 🚀 Videos tutoriales con expertos locales
- 🚀 Webinars mensuales con pediatras
- 🚀 Biblioteca de artículos científicos traducidos

#### 💬 Comunidad Premium
- 🚀 Grupos exclusivos por zona (CABA, GBA, Interior)
- 🚀 Grupos por edad del bebé (0-3 meses, 4-6 meses, etc.)
- 🚀 Chat directo con otros padres premium
- 🚀 Eventos y meetups exclusivos
- 🚀 Acceso prioritario a consultas grupales

#### 🎯 Funciones Avanzadas
- 🚀 Análisis predictivo de patrones (sueño, alimentación)
- 🚀 Alertas inteligentes personalizadas
- 🚀 Modo oscuro
- 🚀 Temas personalizables
- 🚀 Backup automático en múltiples servicios
- 🚀 Sincronización entre dispositivos ilimitada

#### 🚫 Experiencia Premium
- 🚫 **Cero publicidad** (experiencia limpia)
- ⚡ Soporte prioritario (respuesta en 24hs)
- ⚡ Actualizaciones anticipadas de nuevas funciones
- ⚡ Badge exclusivo en la comunidad
- ⚡ Acceso beta a nuevas funcionalidades

#### 💰 Beneficios Adicionales
- 💰 Descuentos en farmacias asociadas (10-15%)
- 💰 Descuentos en tiendas de productos para bebés
- 💰 Acceso a promociones exclusivas de marcas
- 💰 Programa de referidos (gana $500 ARS por cada amigo que se hace premium)

## 🛠️ Stack tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **PWA**: Service Workers + Manifest
- **Autenticación**: NextAuth.js + Google OAuth
- **Base de datos**: Google Sheets API
- **Pagos**: MercadoPago (Argentina)
- **Deploy**: Vercel (recomendado)

## 🏗️ Arquitectura

```
chaupanial/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── auth/          # NextAuth.js
│   ├── components/        # Componentes React
│   ├── dashboard/         # Panel de usuario
│   └── premium/           # Funciones premium
├── lib/                   # Utilidades y servicios
│   ├── googleSheets.ts    # Google Sheets API
│   └── mercadopago.ts     # Integración pagos
├── public/                # Archivos estáticos + PWA
└── types/                 # Definiciones TypeScript
```

## 🚀 Instalación y desarrollo

1. **Clonar el repositorio**
```bash
git clone https://github.com/quinterodiego/chaupanial.git
cd chaupanial
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. **Configurar Google Sheets**
   - Crear proyecto en Google Cloud Console
   - Habilitar Google Sheets API
   - Crear Service Account
   - Descargar credenciales JSON
   - Crear spreadsheet con las hojas: "Usuarios" y "Actividades"

5. **Configurar Google OAuth**
   - En Google Cloud Console
   - Crear credenciales OAuth 2.0
   - Agregar dominio autorizado

6. **Configurar MercadoPago**
   - Crear cuenta de desarrollador
   - Obtener Access Token y Public Key

7. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 📊 Modelo de negocio

### 💰 Estrategia de monetización
- **Freemium**: Funcionalidades básicas siempre gratis
- **Premium**: Pago único de $4.999 ARS (sin suscripciones)
- **Partnerships**: Pediatras, farmacias, marcas infantiles
- **Contenido premium**: Cursos y guías especializadas

### 🎯 Estrategia de conversión Gratis → Premium

#### **Puntos de dolor en versión gratuita (que impulsan la compra):**
1. **Límite de 30 días de historial** → Los padres quieren ver el crecimiento completo
2. **Solo 1 bebé** → Familias con múltiples hijos necesitan Premium
3. **50 registros/mes** → Padres activos se quedan sin espacio rápido
4. **Publicidad** → Experiencia interrumpida
5. **Sin exportación** → No pueden llevar datos al pediatra fácilmente
6. **Sin consultas médicas** → Valor diferencial clave

#### **Ganchos Premium (que justifican el pago):**
1. **1 consulta pediátrica incluida** → Valor inmediato ($3.000-5.000 ARS)
2. **Reportes médicos profesionales** → Ahorro de tiempo y dinero
3. **Múltiples bebés** → Para familias numerosas
4. **Descuentos en farmacias** → Se paga solo con 2-3 compras
5. **Pago único** → Sin preocupaciones de suscripción
6. **Programa de referidos** → Pueden recuperar parte del costo

#### **Momentos clave de conversión:**
- **Día 7-14**: Usuario activo, se queda sin espacio de historial
- **Día 30**: Historial gratuito se borra, necesidad de mantener datos
- **Antes de consulta pediátrica**: Oferta de consulta incluida
- **Nacimiento de segundo hijo**: Necesidad de múltiples bebés
- **Antes de vacuna importante**: Necesidad de recordatorios avanzados

### 🎯 Mercado objetivo
- **Primario**: Padres primerizos en Argentina (25-40 años)
- **Secundario**: Familias con múltiples hijos
- **Terciario**: Cuidadores y abuelos tech-savvy

## 🚀 Roadmap de lanzamiento

### **Fase 1: MVP (Meses 1-3)**
- [ ] Funcionalidades básicas gratuitas
- [ ] Autenticación con Google
- [ ] PWA funcional
- [ ] 1000 usuarios beta

### **Fase 2: Monetización (Meses 4-6)**
- [ ] Integración MercadoPago
- [ ] Consultas con pediatras
- [ ] Contenido premium
- [ ] 5000+ usuarios activos

### **Fase 3: Escalamiento (Meses 7-12)**
- [ ] Partnerships estratégicos
- [ ] Expansión regional (Uruguay, Chile)
- [ ] App móvil nativa
- [ ] 20000+ usuarios

## 🔐 Configuración de seguridad

```env
# Generar secrets seguros
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Variables de producción
NEXTAUTH_URL=https://chaupanial.vercel.app
NODE_ENV=production
```

## 📱 PWA Features

- ✅ Instalable en móviles
- ✅ Funciona offline (básico)
- ✅ Push notifications (futuro)
- ✅ App shortcuts
- ✅ Optimizada para móviles argentinos

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Especialmente de:
- Padres con experiencia en crianza
- Pediatras argentinos
- Desarrolladores con hijos
- UX/UI designers con enfoque en familia

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

## 🇦🇷 Hecho con ❤️ en Argentina

Para padres argentinos, por padres argentinos.

---

**¿Preguntas?** Abre un issue o contacta: [diego@chaupanial.com](mailto:diego@chaupanial.com)