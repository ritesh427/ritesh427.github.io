'use strict';
/* =========================================================
   DevPath Question Bank: Spring Boot & Enterprise Architecture
   ========================================================= */

// sb1: Intro & Auto-configuration
QB.add("sb1", [
  {
    q: "How does Spring Boot auto-configuration discover and load candidate configuration classes in Spring Boot 3+?",
    o: [
      "Through META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports",
      "Through META-INF/spring.factories only",
      "By scanning all packages in the entire classpath at runtime using reflection",
      "Via XML beans loaded through web.xml"
    ],
    a: 0,
    e: "Spring Boot 3 shifted auto-configuration discovery from the legacy META-INF/spring.factories file to the modular META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports file for improved startup performance and AOT compatibility."
  },
  {
    q: "What does the meta-annotation @SpringBootApplication combine?",
    o: [
      "@SpringBootConfiguration, @EnableAutoConfiguration, and @ComponentScan",
      "@Configuration, @EnableWebMvc, and @EnableAsync",
      "@Component, @Service, and @Repository",
      "@EnableAutoConfiguration, @EntityScan, and @EnableJpaRepositories"
    ],
    a: 0,
    e: "@SpringBootApplication is an alias combining @SpringBootConfiguration (specialized @Configuration), @EnableAutoConfiguration (activates conditional beans), and @ComponentScan (scans packages from current package down)."
  },
  {
    q: "What is the primary purpose of Spring Boot Starters (e.g., spring-boot-starter-web)?",
    o: [
      "Curated dependency descriptor sets that provide compatible transitive dependencies and default configurations without version mismatches",
      "Executables that start a remote Docker container",
      "Classes that replace the JVM bootstrap classloader",
      "A plugin that compresses JAR files"
    ],
    a: 0,
    e: "Starters are opinionated BOMs/dependency aggregators that pull in tested, compatible libraries (e.g. Tomcat, Jackson, Spring MVC for starter-web) so developers do not manually manage complex POM dependencies."
  }
]);

// sb4: Spring Annotations
QB.add("sb4", [
  {
    q: "What is the fundamental difference between @Component and @Bean in Spring?",
    o: [
      "@Component is placed on classes for automatic component-scanning; @Bean is placed on factory methods inside @Configuration classes for explicit instantiation",
      "@Component creates singletons; @Bean creates prototypes",
      "@Bean can only be used with XML configuration",
      "@Component is deprecated in Spring Boot 3"
    ],
    a: 0,
    e: "@Component annotates candidate classes for Spring's classpath scanner. @Bean is used inside configuration classes, especially when integrating third-party libraries where class source code cannot be annotated."
  },
  {
    q: "When multiple beans of the same interface exist, how does Spring resolve ambiguity without throwing NoUniqueBeanDefinitionException?",
    o: [
      "Using @Qualifier at injection points, or defining one bean with @Primary",
      "By selecting the bean with the shortest class name",
      "By randomly selecting one of the available beans",
      "By instantiating a proxy that calls all implementations sequentially"
    ],
    a: 0,
    e: "Spring throws NoUniqueBeanDefinitionException if multiple matching candidate beans exist. You resolve this by designating a default with @Primary or specifying the exact target bean using @Qualifier(\"beanName\")."
  },
  {
    q: "What is the behavior of @RestController in Spring MVC?",
    o: [
      "Combines @Controller and @ResponseBody, automatically serializing method return values into HTTP response bodies (e.g. JSON/XML)",
      "Enables WebSocket connections only",
      "Creates a reactive WebClient endpoint instead of a servlet",
      "Forces all responses to be HTML views"
    ],
    a: 0,
    e: "@RestController is a convenience meta-annotation that includes @ResponseBody. Every handler method serializes return objects directly into the response body via HttpMessageConverter rather than resolving view templates."
  }
]);

// sb5: Spring Bean Lifecycle
QB.add("sb5", [
  {
    q: "What is the precise sequence of the Spring Bean lifecycle?",
    o: [
      "Instantiation -> Populate Properties -> BeanNameAware/BeanFactoryAware -> BeanPostProcessor (before) -> @PostConstruct / InitializingBean -> BeanPostProcessor (after)",
      "@PostConstruct -> Instantiation -> Populate Properties -> DisposableBean",
      "Populate Properties -> Instantiation -> @PreDestroy -> @PostConstruct",
      "BeanPostProcessor (after) -> Instantiation -> Populate Properties -> @PostConstruct"
    ],
    a: 0,
    e: "Spring instantiates the bean, populates dependencies, invokes Aware callbacks, runs BeanPostProcessor.postProcessBeforeInitialization, executes @PostConstruct/afterPropertiesSet, and finally runs BeanPostProcessor.postProcessAfterInitialization (which produces proxies like AOP and @Transactional)."
  },
  {
    q: "Which interface allows wrapping or replacing a raw bean instance with a dynamic proxy before it is published to the ApplicationContext?",
    o: [
      "BeanPostProcessor",
      "BeanFactoryPostProcessor",
      "ApplicationListener",
      "SmartLifecycle"
    ],
    a: 0,
    e: "BeanPostProcessor operates on individual bean instances. Its postProcessAfterInitialization method is where Spring AOP creates JDK dynamic proxies or CGLIB proxies for transactions, caching, and async execution."
  },
  {
    q: "What does this code print during Spring context startup?",
    k: "@Component\nclass MyBean implements InitializingBean {\n  MyBean() { System.out.print(\"1 \"); }\n  @PostConstruct void init() { System.out.print(\"2 \"); }\n  public void afterPropertiesSet() { System.out.print(\"3 \"); }\n}",
    o: ["1 2 3 ", "2 1 3 ", "3 2 1 ", "1 3 2 "],
    a: 0,
    e: "First constructor executes (1). Next, JSR-250 @PostConstruct runs via CommonAnnotationBeanPostProcessor (2). Finally, Spring's InitializingBean.afterPropertiesSet() runs (3)."
  }
]);

// sb6: Dependency Injection & Circular Dependencies
QB.add("sb6", [
  {
    q: "Why does the Spring Framework team strongly recommend Constructor Injection over Field Injection (@Autowired on private fields)?",
    o: [
      "It enables true object immutability (final fields), prevents NullPointerExceptions in unit tests without Spring, and detects circular dependencies at startup",
      "Field injection causes JVM memory leaks",
      "Constructor injection is the only injection type compatible with JSON serialization",
      "Field injection was removed in Java 17"
    ],
    a: 0,
    e: "Constructor injection allows fields to be final, makes dependencies explicit for unit testing with 'new MyService(mockRepo)', and avoids reflection hacking to inject fields."
  },
  {
    q: "What happens in Spring Boot 2.6+ when two singletons have a circular dependency using constructor injection?",
    o: [
      "The ApplicationContext fails to start with BeanCurrentlyInCreationException, as circular references are prohibited by default",
      "Spring automatically creates a null reference to break the loop",
      "The JVM crashes with a StackOverflowError at startup",
      "One of the beans is automatically converted to prototype scope"
    ],
    a: 0,
    e: "Spring Boot 2.6+ strictly disables circular references by default. Constructor injection cannot be unraveled because neither instance can be instantiated without the other."
  },
  {
    q: "How can a circular dependency between two beans be temporarily resolved if refactoring architecture is deferred?",
    o: [
      "Using @Lazy on one of the constructor parameters or setting spring.main.allow-circular-references=true",
      "Marking both beans as @Scope(\"prototype\")",
      "Annotating the methods with @Async",
      "Changing both classes to interfaces"
    ],
    a: 0,
    e: "@Lazy creates a dynamic proxy for the target bean at injection time, deferring actual resolution until the bean's methods are first invoked, thereby breaking the circular instantiation loop."
  }
]);

// sb7: Bean Scopes
QB.add("sb7", [
  {
    q: "What happens when a Singleton bean injects a Prototype bean via standard @Autowired constructor injection?",
    o: [
      "The Prototype bean is instantiated exactly once during Singleton creation and is reused across all subsequent calls (losing prototype behavior)",
      "A new Prototype bean is instantiated on every method call on the Singleton",
      "Spring throws an IllegalScopeException at startup",
      "The Singleton is automatically converted to prototype scope"
    ],
    a: 0,
    e: "Because dependency injection occurs only once during bean creation, the Singleton retains the exact same Prototype instance forever. To get a fresh prototype each time, use ObjectFactory<T>, Provider<T>, or @Lookup method injection."
  },
  {
    q: "What is the purpose of proxyMode = ScopedProxyMode.TARGET_CLASS when injecting a request-scoped bean into a singleton service?",
    o: [
      "Injects a CGLIB proxy that dynamically delegates method invocations to the current HTTP request's thread-bound bean instance",
      "Encrypts the bean state in HTTP headers",
      "Forces the singleton to be destroyed after the HTTP request finishes",
      "Disables multi-threading on the request bean"
    ],
    a: 0,
    e: "A singleton is created at context startup when no HTTP request exists. A scoped proxy acts as a surrogate placeholder that looks up the active thread's request context at runtime."
  }
]);

// sb9: Conditional Beans
QB.add("sb9", [
  {
    q: "What is the behavior of @ConditionalOnProperty in this snippet?",
    k: "@Bean\n@ConditionalOnProperty(prefix = \"feature.payment\", name = \"enabled\", havingValue = \"true\", matchIfMissing = false)\npublic PaymentGateway gateway() { return new StripeGateway(); }",
    o: [
      "The bean is created only if feature.payment.enabled is explicitly configured as 'true' in properties",
      "The bean is created always because matchIfMissing is false",
      "The bean is created if the property is absent",
      "Throws an exception if the property is missing"
    ],
    a: 0,
    e: "matchIfMissing = false means if the property 'feature.payment.enabled' is not defined in application.properties/yaml, condition evaluation fails and the bean is not registered."
  },
  {
    q: "Which conditional annotation ensures a fallback default bean is created only if no other bean of that type was registered by user configuration?",
    o: [
      "@ConditionalOnMissingBean",
      "@ConditionalOnClass",
      "@ConditionalOnSingleCandidate",
      "@Primary"
    ],
    a: 0,
    e: "@ConditionalOnMissingBean is the cornerstone of Spring Boot auto-configuration. It allows developers to override default framework beans simply by defining their own bean."
  }
]);

// sb11: Spring AOP (Aspect-Oriented Programming)
QB.add("sb11", [
  {
    q: "Why does calling a method annotated with @Transactional or @Async from another method within the SAME class (self-invocation) fail to apply the aspect?",
    o: [
      "The call invokes 'this.targetMethod()' directly on the raw instance, bypassing the Spring AOP proxy wrapper",
      "Spring AOP disables transactions for private and public methods in the same package",
      "The compiler strips annotations during bytecode generation for intra-class calls",
      "The JVM thread stack loses transaction metadata"
    ],
    a: 0,
    e: "Spring AOP uses proxy wrappers (JDK Dynamic or CGLIB). Calls from outside pass through the proxy interceptor. Calls from within the target class invoke 'this.method()', which bypasses the proxy entirely."
  },
  {
    q: "What is the default proxy mechanism used by Spring Boot 2.x and 3.x?",
    o: [
      "CGLIB (subclass-based proxies) with spring.aop.proxy-target-class=true by default",
      "JDK Dynamic Proxies exclusively (interface-based)",
      "AspectJ compile-time weaving only",
      "Java native agents using ByteBuddy"
    ],
    a: 0,
    e: "Spring Boot enables CGLIB subclass proxying by default (proxyTargetClass = true). This allows proxying classes directly without requiring them to implement an interface."
  },
  {
    q: "Which advice type can prevent the target method from executing, inspect its arguments, and modify its return value?",
    o: [
      "@Around (using ProceedingJoinPoint.proceed())",
      "@Before",
      "@AfterReturning",
      "@AfterThrowing"
    ],
    a: 0,
    e: "@Around advice surrounds the joint point. It takes a ProceedingJoinPoint argument and controls whether and when proceed() is called, allowing caching, security checks, and response modification."
  }
]);

// sb12: Transaction Management (@Transactional)
QB.add("sb12", [
  {
    q: "By default, which exceptions trigger an automatic rollback in a Spring @Transactional method?",
    o: [
      "Unchecked exceptions (RuntimeException and its subclasses) and Errors only",
      "All exceptions including checked exceptions (java.lang.Exception)",
      "Only java.sql.SQLException",
      "NullPointerException only"
    ],
    a: 0,
    e: "By default, Spring transactions roll back only on unchecked exceptions (RuntimeException) and Error. Checked exceptions (subclasses of Exception not extending RuntimeException) commit unless specified via @Transactional(rollbackFor = Exception.class)."
  },
  {
    q: "What is the difference between Propagation.REQUIRED and Propagation.REQUIRES_NEW?",
    o: [
      "REQUIRED joins an existing transaction or creates one if none exists; REQUIRES_NEW suspends any existing transaction and always creates a brand new independent transaction",
      "REQUIRED always creates a new transaction; REQUIRES_NEW joins existing",
      "REQUIRED runs asynchronously; REQUIRES_NEW runs synchronously",
      "REQUIRES_NEW runs in read-only mode"
    ],
    a: 0,
    e: "REQUIRED participates in the caller's transaction context. REQUIRES_NEW pauses the outer transaction, executes its own transaction commit/rollback independently, and then resumes the outer transaction."
  },
  {
    q: "What happens if a method annotated with @Transactional is declared with 'private' visibility in standard Spring AOP?",
    o: [
      "No transaction is started because Spring AOP proxies cannot override private methods; the method executes without transactional management",
      "Spring throws an IllegalAccessException at startup",
      "The method is automatically promoted to public by the classloader",
      "The database enforces the transaction natively"
    ],
    a: 0,
    e: "Proxies can only intercept public method calls. Annotating private, protected, or package-private methods with @Transactional is silently ignored by Spring AOP proxies."
  }
]);

// sb18: Filters vs Interceptors
QB.add("sb18", [
  {
    q: "Where do Servlet Filters and Spring HandlerInterceptors execute in the HTTP request processing pipeline?",
    o: [
      "Filters execute in the Servlet container before DispatcherServlet; Interceptors execute inside Spring MVC after DispatcherServlet but before controllers",
      "Interceptors execute at the network firewall; Filters execute inside controllers",
      "Filters execute after Spring Controllers; Interceptors execute before Tomcat starts",
      "They are identical and execute in parallel"
    ],
    a: 0,
    e: "Filters belong to the standard Servlet container (Tomcat) and intercept requests before they reach Spring's DispatcherServlet. Interceptors are Spring MVC components executed around handler mapping dispatch."
  },
  {
    q: "Which component has access to the target Spring Controller's HandlerMethod and annotations via its preHandle() method?",
    o: [
      "HandlerInterceptor",
      "Servlet Filter",
      "ApplicationContextInitializer",
      "Tomcat Valve"
    ],
    a: 0,
    e: "HandlerInterceptor.preHandle(request, response, Object handler) receives the 'handler' parameter, which can be cast to HandlerMethod to inspect controller annotations (like custom authorization or rate limiting)."
  }
]);

// sb22: Spring Data JPA Architecture
QB.add("sb22", [
  {
    q: "What are the four entity lifecycle states in JPA / Hibernate?",
    o: [
      "Transient (New), Managed (Persistent), Detached, and Removed",
      "Draft, Active, Archived, and Deleted",
      "Uncommitted, Committed, RolledBack, and Closed",
      "Heap, Metaspace, Stack, and Database"
    ],
    a: 0,
    e: "Transient: newly instantiated with no DB identity. Managed: associated with an active EntityManager/Persistence Context. Detached: Persistence Context closed. Removed: marked for DB deletion upon commit."
  },
  {
    q: "How does Hibernate detect which fields changed on a managed entity to issue an UPDATE statement without calling repository.save()?",
    o: [
      "Automatic Dirty Checking during flush: compares the entity's current property values with a snapshot taken when it became managed",
      "By placing triggers directly on the database table",
      "By compiling getters with bytecode instrumentation",
      "By polling the object every 100 milliseconds"
    ],
    a: 0,
    e: "When an entity enters the Managed state, Hibernate stores an internal snapshot of its fields. At transaction flush/commit, dirty checking compares current state to the snapshot and generates minimal SQL UPDATEs."
  }
]);

// sb24: JPA Level 1 vs Level 2 Cache
QB.add("sb24", [
  {
    q: "What is the scope and lifecycle of JPA's Level 1 (First-Level) Cache?",
    o: [
      "Scoped to the active EntityManager / Persistence Context (typically a single transaction or HTTP request thread); enabled by default and cannot be turned off",
      "Shared across all application servers and cluster nodes",
      "Stored in Redis or Memcached permanently",
      "Scoped to the JVM process lifetime across all threads"
    ],
    a: 0,
    e: "The Level 1 cache belongs exclusively to the EntityManager session. Within a transaction, calling findById() multiple times with the same ID returns the cached in-memory reference without querying SQL again."
  },
  {
    q: "How does the JPA Level 2 (Second-Level) Cache differ from Level 1?",
    o: [
      "Level 2 is optional, scoped to the EntityManagerFactory, shared across sessions/transactions, and requires an external caching provider (e.g. Ehcache, Hazelcast, Redis)",
      "Level 2 is enabled by default and caches query strings only",
      "Level 2 only caches native SQL queries",
      "Level 2 is destroyed whenever a transaction commits"
    ],
    a: 0,
    e: "Level 2 cache outlives individual transactions. It is tied to the EntityManagerFactory and caches entity data across concurrent sessions, preventing repeat database lookups across user requests."
  }
]);

// sb28: JPA Relationships & The N+1 Query Problem
QB.add("sb28", [
  {
    q: "What is the dreaded 'N+1 Query Problem' in ORMs like Hibernate?",
    o: [
      "Fetching 1 parent entity query followed by N individual separate SQL queries to load its associated lazy child collections in a loop",
      "Attempting to insert N+1 records into a table with only N capacity",
      "A database deadlock caused by executing N concurrent queries",
      "Running a query that takes N+1 seconds to complete"
    ],
    a: 0,
    e: "If you query for N parent orders and then access order.getItems() in a loop with FetchType.LAZY, Hibernate executes 1 query for the orders plus N separate queries for each order's items."
  },
  {
    q: "What is the most effective way to eliminate the N+1 problem in a Spring Data JPA repository?",
    o: [
      "Use 'JOIN FETCH' in a JPQL query or apply @EntityGraph on the repository method",
      "Change the relationship to FetchType.EAGER everywhere",
      "Increase the database connection pool size",
      "Wrap each loop iteration in a separate @Transactional method"
    ],
    a: 0,
    e: "FetchType.EAGER often still causes N+1 queries under JPQL. A 'JOIN FETCH' or @EntityGraph forces Hibernate to perform a single SQL JOIN that fetches both parent and children together in one trip."
  }
]);

// sb37: Spring Security & JWT
QB.add("sb37", [
  {
    q: "Where in the Spring Security filter chain should a custom JwtAuthenticationFilter be inserted?",
    o: [
      "Before UsernamePasswordAuthenticationFilter (via http.addFilterBefore)",
      "After FilterSecurityInterceptor",
      "Outside the Servlet container",
      "Directly inside the Controller method"
    ],
    a: 0,
    e: "A JWT filter extracts the 'Authorization: Bearer <token>' header, verifies signature, and populates SecurityContextHolder BEFORE Spring's UsernamePasswordAuthenticationFilter attempts form-based auth."
  },
  {
    q: "Where does Spring Security store the active authenticated user's Principal and GrantedAuthorities?",
    o: [
      "SecurityContextHolder.getContext().getAuthentication() (typically backed by ThreadLocal)",
      "In a static global array in Metaspace",
      "In an unencrypted client-side cookie",
      "Directly in the database session table on every request"
    ],
    a: 0,
    e: "SecurityContextHolder holds the SecurityContext, which defaults to ThreadLocal storage (MODE_THREADLOCAL). It binds authentication state to the single worker thread processing the request."
  }
]);

// sb42: Spring Boot Actuator
QB.add("sb42", [
  {
    q: "Which application property configuration exposes all Actuator endpoints over HTTP in Spring Boot?",
    o: [
      "management.endpoints.web.exposure.include=*",
      "actuator.endpoints.all=true",
      "management.security.enabled=false",
      "server.actuator.export=all"
    ],
    a: 0,
    e: "By default, only /health is exposed over web HTTP. Setting management.endpoints.web.exposure.include=* exposes metrics, env, beans, loggers, prometheus, and mappings."
  },
  {
    q: "In a Kubernetes deployment, how are Spring Boot Actuator's /health/liveness and /health/readiness probes used?",
    o: [
      "Liveness checks if the container is healthy or needs restarting; Readiness checks if the app is ready to receive live traffic from Kubernetes Services",
      "Both probes perform identical garbage collection cycles",
      "Liveness is for database migrations; Readiness is for CPU cooling",
      "Readiness restarts the pod if a single HTTP 500 occurs"
    ],
    a: 0,
    e: "Kubernetes uses livenessProbe to know when to kill and restart a deadlocked container. It uses readinessProbe to know when the app has finished initialization and can route user traffic to it."
  }
]);
