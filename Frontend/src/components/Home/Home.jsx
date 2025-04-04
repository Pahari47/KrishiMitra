import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import leafimg from "../../assets/leafimg.jpg";
import aboutusimg from "../../assets/aboutusimg.jpg";

const features = [
  {
    title: "Weather & Soil Data",
    description: "Accurate insights from APIs & real-time data",
    icon: "🌱",
    color: "bg-green-100",
  },
  {
    title: "AI Crop Recommendation",
    description: "Smart predictions based on soil & climate",
    icon: "🤖",
    color: "bg-blue-100",
  },
  {
    title: "Pest & Disease Detection",
    description: "AI-driven plant health monitoring",
    icon: "🍃",
    color: "bg-yellow-100",
  },
  {
    title: "IoT Soil Monitoring",
    description: "Live real-time moisture & pH tracking",
    icon: "📡",
    color: "bg-purple-100",
  },
];

const testimonials = [
  {
    name: "Mark Jackson",
    role: "Farm Owner",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    feedback:
      "Krishii Mitra transformed our farming operations! The AI recommendations helped us increase yield by 30% while reducing water usage.",
  },
  {
    name: "Anna Smith",
    role: "Agricultural Researcher",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    feedback:
      "The soil monitoring system is incredibly accurate. I've recommended Krishii Mitra to all my colleagues in the research community.",
  },
  {
    name: "John Champion",
    role: "Organic Farmer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    feedback:
      "The pest detection feature saved my entire crop season. Early warnings allowed me to take preventive measures in time.",
  },
];

const AnimatedSection = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 overflow-hidden scroll-mt-20">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Decorative text background */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-200 text-[180px] md:text-[250px] lg:text-[300px] opacity-10 font-bold tracking-wider select-none z-0">
            KRISHII<br />
            MITRA
          </div>

          {/* Animated floating elements - expanded */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${i % 3 === 0 ? 'bg-green-100' : i % 3 === 1 ? 'bg-teal-100' : 'bg-emerald-100'} opacity-20`}
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, (Math.random() - 0.5) * 60],
                x: [0, (Math.random() - 0.5) * 40],
                rotate: [0, (Math.random() - 0.5) * 20]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}

          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 py-20">
          {/* Left Content - Enhanced */}
          <motion.div
            className="md:w-1/2 mb-12 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated badge */}
            <motion.div
              className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full mb-6 text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.span
                className="inline-block mr-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌱
              </motion.span>
              New Feature: AI Crop Advisor
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                textShadow: [
                  "0 0 0px rgba(5, 150, 105, 0)",
                  "0 0 5px rgba(5, 150, 105, 0.2)",
                  "0 0 0px rgba(5, 150, 105, 0)"
                ]
              }}
              transition={{
                duration: 0.8,
                textShadow: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              TRANSFORM <br className="hidden md:block" />
              <motion.span
                className="text-green-600 inline-block"
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 0px rgba(5, 150, 105, 0)",
                    "0 0 8px rgba(5, 150, 105, 0.4)",
                    "0 0 0px rgba(5, 150, 105, 0)"
                  ]
                }}
                transition={{
                  scale: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  textShadow: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                FARMING
              </motion.span> PRACTICES
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Revolutionizing agriculture through artificial intelligence and IoT technology.
              Get personalized crop recommendations and real-time farm monitoring.
            </motion.p>

            {/* Interactive Stats Grid */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { value: "30%", label: "Yield Increase" },
                { value: "50K+", label: "Farmers" },
                { value: "24/7", label: "Monitoring" },
                { value: "95%", label: "Accuracy" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                >
                  <p className="text-2xl font-bold text-green-600">{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                className="px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all font-medium flex items-center group"
                whileHover={{
                  scale: 1.05,
                  background: "linear-gradient(to right, #059669, #10b981)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Start Free Trial
                <motion.span
                  className="ml-2 inline-block group-hover:translate-x-1 transition-transform"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>

              <motion.button
                className="px-8 py-3.5 bg-white text-green-600 border-2 border-green-600 rounded-full shadow-lg hover:bg-gray-50 transition-all font-medium flex items-center"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(5, 150, 105, 0.05)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </motion.button>
            </div>

            {/* Enhanced Trust Indicators */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-gray-500 text-sm mb-3">Trusted by farmers worldwide</p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <motion.img
                      key={item}
                      src={`https://randomuser.me/api/portraits/${item % 2 === 0 ? 'women' : 'men'}/${item + 20}.jpg`}
                      className="w-10 h-10 rounded-full border-2 border-white"
                      alt="User"
                      whileHover={{ zIndex: 1, scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ))}
                </div>
                <div className="border-l border-gray-200 pl-4">
                  <div className="flex items-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm font-medium text-gray-700">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500">5000+ happy farmers</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Enhanced */}
          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative max-w-lg">
              {/* Glow effect */}
              <motion.div
                className="absolute -inset-6 bg-green-200 rounded-3xl blur-xl opacity-20"
                animate={{
                  rotate: [0, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Main image with floating elements */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-white">
                <motion.img
                  src={leafimg}
                  alt="Agricultural technology"
                  className="w-full h-auto object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Floating UI elements */}
                <motion.div
                  className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-sm">Live Soil Data</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">pH: 6.5 | Moisture: 72%</div>
                </motion.div>

                <motion.div
                  className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md w-32"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="text-xs text-gray-500 mb-1">Weather Forecast</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">28°C</span>
                    <span className="text-2xl">🌤️</span>
                  </div>
                </motion.div>
              </div>

              {/* Floating notification */}
              <motion.div
                className="absolute -bottom-5 -right-5 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="font-medium text-gray-700">Real-time Alerts</span>
              </motion.div>

              {/* Animated crop cycle indicator */}
              <motion.div
                className="absolute -left-10 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-lg shadow-md hidden lg:block"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-gray-500">Crop Cycle</div>
                  <div className="w-16 h-16 relative">
                    {['tomato', 'wheat', 'corn'].map((crop, i) => (
                      <motion.div
                        key={crop}
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          rotate: i * 120,
                          scale: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                      >
                        <span className="text-2xl">
                          {crop === 'tomato' ? '🍅' : crop === 'wheat' ? '🌾' : '🌽'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scrolling indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-sm text-gray-500 mb-2">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-white scroll-mt-20">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <motion.h2 className="text-4xl font-bold text-gray-800 mb-4">
                Our Powerful Features
              </motion.h2>
              <motion.p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Harnessing cutting-edge technology to empower farmers with data-driven decisions
              </motion.p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  className={`p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow ${feature.color}`}
                  whileHover={{ y: -10 }}
                >
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-teal-50 to-green-50 scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimatedSection delay={0.2} className="lg:w-1/2">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute -inset-4 bg-teal-200 rounded-3xl blur-lg opacity-30 z-0"></div>
                <img
                  src={aboutusimg}
                  alt="Our team"
                  className="relative rounded-2xl shadow-xl w-100 object-cover z-10"
                />
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.4} className="lg:w-1/2">
              <div className="">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  <span className="text-green-600">Who</span> We Are
                </h2>

                <p className="text-lg text-gray-600 mb-6">
                  We are a team of agricultural technologists, data scientists, and farming experts
                  dedicated to bridging the gap between traditional farming and modern technology.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                    </div>
                    <p className="ml-3 text-gray-700">
                      <span className="font-semibold">5+ years</span> of experience in agricultural technology
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                    </div>
                    <p className="ml-3 text-gray-700">
                      Serving <span className="font-semibold">10,000+ farmers</span> across India
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                    </div>
                    <p className="ml-3 text-gray-700">
                      <span className="font-semibold">95% accuracy</span> in crop recommendations
                    </p>
                  </div>
                </div>

                <motion.button
                  className="mt-8 px-8 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Meet Our Team
                </motion.button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonial" className="py-20 bg-white scroll-mt-20">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">What Farmers Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Trusted by agricultural professionals across the country
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 0.15}>
                <motion.div
                  className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.feedback}"</p>
                  <div className="flex mt-4 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <AnimatedSection>
            <motion.h2
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Ready to Transform Your Farming?
            </motion.h2>

            <motion.p
              className="text-xl mb-8 max-w-2xl mx-auto opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Join thousands of farmers who are already benefiting from our AI-powered platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <button className="px-8 py-3 bg-white text-green-600 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors mr-4">
                Start Free Trial
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:bg-opacity-10 transition-colors">
                Schedule Demo
              </button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-teal-500 p-12 text-white">
                <AnimatedSection delay={0.2}>
                  <h2 className="text-3xl font-bold mb-6">Contact Us</h2>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="ml-3">contact@krishiimitra.com</p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <p className="ml-3">+91 98765 43210</p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="ml-3">
                        Krishii Mitra HQ<br />
                        Durgapur, westbengal<br />
                        India - 721445
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                      {['facebook', 'twitter', 'linkedin', 'instagram'].map((social, i) => (
                        <motion.a
                          key={i}
                          href="#"
                          className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition"
                          whileHover={{ y: -3 }}
                        >
                          <span className="sr-only">{social}</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d={`M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z`} />
                          </svg>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              <div className="md:w-1/2 p-12">
                <AnimatedSection delay={0.4}>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a message</h2>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        id="message"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Your message..."
                      ></textarea>
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Send Message
                    </motion.button>
                  </form>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;