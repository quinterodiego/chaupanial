'use client'

import React, { useEffect } from 'react'
import { Header } from './components/Header'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from './components/ui/button'
import { 
  Baby, Calendar, Users, Heart, Crown, CheckCircle, 
  Shield, Clock, Star, ArrowRight, Smartphone, 
  FileText, MessageCircle, TrendingUp, Award, Droplet, Lightbulb
} from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirigir usuarios autenticados al dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      // Redirigir a login con callback al dashboard
      signIn('google', { callbackUrl: '/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-20 md:py-32 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8CCFE0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E9A5B4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#9CDFF0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="inline-block mb-6 animate-slide-in">
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold shadow-md border border-[#8CCFE0]/30">
                🍼 Tu compañero en el control de esfínteres
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-700 mb-6 leading-tight tracking-tight">
              Chau{' '}
              <span className="gradient-text">
                Pañal
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              La app para acompañar a tu bebé en el proceso de{' '}
              <span className="font-semibold text-gray-800">control de esfínteres</span>.
              <br className="hidden md:block" />
              <span className="text-gray-500">Registros, seguimiento y tips para este momento tan importante.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {!session ? (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold"
                    onClick={handleGetStarted}
                  >
                    🚀 Comenzar Gratis
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-10 py-7 border-2 border-[#CBD5E1] bg-white text-[#1E293B] hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold"
                    onClick={() => router.push('/premium')}
                  >
                    <Crown className="mr-2" size={20} />
                    Ver Premium
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold"
                  onClick={() => router.push('/dashboard')}
                  >
                    Ir al Dashboard
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover-lift">
                <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">1000+</div>
                <div className="text-sm text-gray-700 font-medium">Padres activos</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover-lift">
                <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">5000+</div>
                <div className="text-sm text-gray-700 font-medium">Registros de esfínteres</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover-lift">
                <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">4.9★</div>
                <div className="text-sm text-gray-700 font-medium">Valoración</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative container mx-auto px-4 py-24 bg-gray-50">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-700 mb-6 tracking-tight">
              Todo para el control de esfínteres
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-light">
              Funcionalidades diseñadas para acompañar a tu bebé en este proceso tan importante
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <FeatureCard
              icon={<Droplet />}
              title="Registro de esfínteres"
              description="Registra cada vez que tu bebé usa el baño. Historial de 30 días en gratis, ilimitado en Premium."
              free={true}
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Estadísticas básicas"
              description="Visualiza el progreso con contadores diarios de esfínteres. Estadísticas disponibles en ambos planes."
              free={true}
            />
            <FeatureCard
              icon={<Calendar />}
              title="Calendario de progreso"
              description="Vista de calendario con últimos 30 días (gratis) o calendario completo sin límites (Premium)."
              free={true}
              premium={true}
            />
            <FeatureCard
              icon={<Users />}
              title="Gestión de familia"
              description="Comparte registros con familiares y gestiona múltiples bebés. Solo disponible en Premium."
              premium={true}
            />
            <FeatureCard
              icon={<Lightbulb />}
              title="Tips diarios"
              description="Consejos prácticos diarios sobre control de esfínteres para acompañar el proceso."
              free={true}
            />
            <FeatureCard
              icon={<MessageCircle />}
              title="Comunidad de padres"
              description="Conecta con otros padres. Comparte experiencias y consejos sobre control de esfínteres."
              free={true}
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              Planes que se adaptan a ti
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Comienza gratis y actualiza cuando lo necesites
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200 flex flex-col">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-700">Gratis</h3>
                <div className="text-5xl font-bold text-gray-700 mb-2">
                  $0
                </div>
                <p className="text-gray-700">Siempre gratis</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Registro de esfínteres (hasta 50 por mes)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Historial de últimos 30 días</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Estadísticas básicas (contadores diarios)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Vista de calendario (últimos 30 días)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Editar y eliminar registros</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Búsqueda y filtros de registros</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Tips diarios sobre control de esfínteres</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Comunidad de padres</span>
                </li>
              </ul>
              
              <Button 
                className="w-full mt-auto" 
                size="lg"
                variant="outline"
                onClick={handleGetStarted}
              >
                Comenzar Gratis
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-[#8CCFE0] to-[#E9A5B4] rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 relative flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-700 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Más Popular
                </span>
              </div>
              
              <div className="text-center mb-8 text-gray-700">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="text-yellow-500 mr-2" size={24} />
                  <h3 className="text-2xl font-bold">Premium</h3>
                </div>
                <div className="text-5xl font-bold mb-2">
                  $28.999
                </div>
                <p className="text-gray-700">Pago único - Para siempre</p>
              </div>
              
              <ul className="space-y-4 mb-8 text-gray-800 flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700"><strong>Todo lo gratis +</strong></span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Registros ilimitados (sin límite mensual)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Historial completo (sin límite de días)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Calendario completo de progreso</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Gestión de familia (múltiples bebés)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Compartir registros con familiares</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Exportar registros para pediatra (PDF)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span>Modo oscuro</span>
                </li>
              </ul>
              
              <Button 
                className="w-full mt-auto bg-white text-blue-600 hover:bg-gray-100 font-bold" 
                size="lg"
                onClick={() => router.push('/premium')}
              >
                Actualizar a Premium
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              Lo que dicen los padres
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Miles de padres confían en Chau Pañal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              name="María González"
              location="Buenos Aires"
              rating={5}
              text="Increíble app para el control de esfínteres. Me ayuda a llevar el registro de cada vez que mi bebé usa el baño. Los recordatorios son geniales. La recomiendo 100%."
            />
            <TestimonialCard
              name="Juan Pérez"
              location="Córdoba"
              rating={5}
              text="Como padre primerizo, esta app me salvó en el proceso de control de esfínteres. Los recordatorios y la comunidad de padres son geniales. Vale cada peso."
            />
            <TestimonialCard
              name="Ana Martínez"
              location="Rosario"
              rating={5}
              text="Los gráficos y estadísticas de Premium son increíbles. Puedo ver el progreso del control de esfínteres día a día. Muy útil para entender cuándo mi bebé está listo."
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="¿Es realmente gratis?"
              answer="Sí, la versión gratuita es completamente gratis para siempre. Incluye registro de esfínteres (hasta 50 por mes), historial de últimos 30 días, estadísticas básicas, vista de calendario (30 días), edición y eliminación de registros, búsqueda y filtros, tips diarios y acceso a la comunidad."
            />
            <FAQItem
              question="¿Qué incluye Premium?"
              answer="Premium incluye todo lo gratis más: registros ilimitados (sin límite mensual), historial completo (sin límite de días), calendario completo de progreso, gestión de familia (múltiples bebés), compartir registros con familiares, exportar registros para pediatra en formato PDF y modo oscuro."
            />
            <FAQItem
              question="¿Puedo usar la app sin internet?"
              answer="Sí, la app funciona offline de forma básica. Puedes ver tus últimos registros y crear nuevos que se sincronizarán cuando tengas conexión."
            />
            <FAQItem
              question="¿Los datos están seguros?"
              answer="Absolutamente. Todos los datos están encriptados y almacenados de forma segura. Nunca compartimos información con terceros."
            />
            <FAQItem
              question="¿Puedo cancelar Premium?"
              answer="Premium es un pago único, no una suscripción. Una vez que lo compras, es tuyo para siempre. No hay cancelaciones porque no hay renovaciones."
            />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] text-[#1E293B] text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-gray-700">
              Únete a miles de padres que ya están acompañando a sus bebés en el control de esfínteres
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session ? (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 font-bold"
                    onClick={handleGetStarted}
                  >
                    🚀 Comenzar Gratis Ahora
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white text-lg px-8 py-6"
                    onClick={() => router.push('/premium')}
                  >
                    <Crown className="mr-2" size={20} />
                    Ver Premium
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 font-bold"
                  onClick={() => router.push('/dashboard')}
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  free?: boolean
  premium?: boolean
}

function FeatureCard({ icon, title, description, free, premium }: FeatureCardProps) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="text-primary-600 bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-md">
          {icon}
        </div>
        {free && (
          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs px-4 py-1.5 rounded-full font-bold shadow-sm border border-green-200">
            Gratis
          </span>
        )}
        {premium && (
          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-4 py-1.5 rounded-full font-bold shadow-sm border border-purple-200">
            Premium
          </span>
        )}
      </div>
      <h4 className="font-bold text-xl mb-3 text-gray-700 group-hover:text-primary-600 transition-colors">{title}</h4>
      <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

interface TestimonialCardProps {
  name: string
  location: string
  rating: number
  text: string
}

function TestimonialCard({ name, location, rating, text }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
        ))}
      </div>
      <p className="text-gray-700 mb-4 leading-relaxed italic">"{text}"</p>
      <div className="border-t border-gray-100 pt-4">
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-700">{location}</p>
      </div>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-700">{question}</span>
        <span className={`text-gray-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-700 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}