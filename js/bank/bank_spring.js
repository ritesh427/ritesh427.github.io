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

// sb1_2: Spring Boot Intro (Original)
QB.add("sb1_2", [
  {
    q: "How does Spring Boot's '@SpringBootApplication' annotation bootstrap an enterprise application?",
    o: [
      "It is a convenience meta-annotation combining @Configuration, @EnableAutoConfiguration, and @ComponentScan",
      "It compiles Java source code directly to machine assembly",
      "It starts a Docker container daemon in the background",
      "It disables the Spring ApplicationContext to conserve memory"
    ],
    a: 0,
    e: "@SpringBootApplication encapsulates @Configuration (defines bean sources), @EnableAutoConfiguration (imports auto-configuration beans based on classpath JARs), and @ComponentScan (scans the current package and sub-packages)."
  }
]);

// sb2: Spring Boot Setup & Architecture
QB.add("sb2", [
  {
    q: "In Spring Boot 3, how does the new auto-configuration registration mechanism differ from legacy 'spring.factories'?",
    o: [
      "Auto-configurations are now declared in 'META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports' as a plain list of class names",
      "Auto-configurations must now be hardcoded in the pom.xml",
      "Spring Boot 3 no longer supports auto-configuration",
      "They must be registered via Windows Registry keys"
    ],
    a: 0,
    e: "Starting in Spring Boot 2.7 and strictly enforced in Spring Boot 3+, auto-configuration classes must be listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports, deprecating the legacy spring.factories key."
  }
]);

// sb3: Maven Lifecycle
QB.add("sb3", [
  {
    q: "In the default Maven build lifecycle, which phase executes immediately before 'package'?",
    o: [
      "compile",
      "test",
      "verify",
      "install"
    ],
    a: 1,
    e: "The standard default Maven build lifecycle sequence is: validate -> compile -> test -> package -> verify -> install -> deploy. Unit tests are executed during the 'test' phase before packaging the JAR."
  },
  {
    q: "What is the key difference between 'mvn install' and 'mvn deploy'?",
    o: [
      "install installs dependencies to node_modules; deploy pushes to Heroku",
      "install puts the artifact into the local repository (~/.m2/repository); deploy copies it to a remote artifact repository (e.g. Nexus / Artifactory)",
      "install is for Docker; deploy is for Kubernetes",
      "They are identical commands"
    ],
    a: 1,
    e: "mvn install stores the built package into the developer's local ~/.m2 repository for local reuse. mvn deploy publishes the final package to a shared remote artifact repository for team or production consumption."
  }
]);

// sb4_2: Annotations (Orig)
QB.add("sb4_2", [
  {
    q: "What is the distinction between '@Component' and '@Bean' in Spring?",
    o: [
      "@Component is a class-level stereotype auto-detected via classpath scanning; @Bean is a method-level annotation used within @Configuration classes, ideal for configuring third-party libraries",
      "@Bean can only be used on interfaces",
      "@Component creates prototypes; @Bean only creates singletons",
      "@Bean is deprecated in Spring Boot 3"
    ],
    a: 0,
    e: "@Component marks your own classes for automatic detection and registration by @ComponentScan. @Bean is placed on factory methods in @Configuration classes, allowing full programmatic instantiation—especially when registering classes from external JARs."
  }
]);

// sb5_2: Bean Lifecycle (Orig)
QB.add("sb5_2", [
  {
    q: "Which Spring component allows custom modification of new bean instances before AND after initialization callbacks (such as @PostConstruct)?",
    o: [
      "BeanPostProcessor (postProcessBeforeInitialization & postProcessAfterInitialization)",
      "BeanFactoryPostProcessor",
      "ServletFilter",
      "ApplicationEventPublisher"
    ],
    a: 0,
    e: "BeanPostProcessor intercepts every bean instance created by the ApplicationContext. It runs before and after initialization callbacks, and is the core mechanism Spring uses to wrap beans with AOP dynamic proxies."
  }
]);

// sb6_2: Dependency Injection (Orig)
QB.add("sb6_2", [
  {
    q: "Why is Constructor Injection strongly recommended over Field Injection (@Autowired on private fields)?",
    o: [
      "Constructor injection promotes immutability (final fields), prevents NullPointerExceptions during unit testing without Spring, and prevents circular dependencies at startup",
      "Constructor injection uses less JVM heap memory",
      "Field injection is completely prohibited by the Java compiler",
      "Constructor injection allows bypassing private access restrictions"
    ],
    a: 0,
    e: "Constructor injection allows fields to be marked 'final' (guaranteeing immutability and thread safety), ensures required dependencies are supplied at instantiation time, and makes testing trivial with plain 'new MyService(mockRepo)'."
  }
]);

// sb8: Dynamic Init Beans
QB.add("sb8", [
  {
    q: "Which conditional annotation conditionally creates a Spring bean only when a specific property is set to a given value in application.yml?",
    o: [
      "@ConditionalOnProperty(name = 'feature.enabled', havingValue = 'true', matchIfMissing = false)",
      "@ConditionalOnClass",
      "@ConditionalOnMissingBean",
      "@Profile"
    ],
    a: 0,
    e: "@ConditionalOnProperty checks environment configuration. If feature.enabled matches havingValue (or matchIfMissing is true), the bean or @Configuration is instantiated; otherwise, it is skipped entirely."
  }
]);

// sb10: Spring Profiles
QB.add("sb10", [
  {
    q: "How does Spring Boot resolve configuration property precedence when 'application-prod.yml' is active alongside the base 'application.yml'?",
    o: [
      "The profile-specific 'application-prod.yml' overrides matching keys defined in the default 'application.yml'",
      "application.yml overrides application-prod.yml",
      "Spring Boot throws a DuplicatePropertyException and aborts",
      "Properties are randomly merged"
    ],
    a: 0,
    e: "Profile-specific property files (application-{profile}.yml) are loaded after default application.yml, giving them higher precedence to override base defaults."
  }
]);

// sb13: Transactional (Part 2) - Propagation
QB.add("sb13", [
  {
    q: "What happens when a method annotated with '@Transactional(propagation = Propagation.REQUIRES_NEW)' is called from inside an existing active transaction?",
    o: [
      "The outer transaction is suspended, and a completely new physical database transaction is started for the inner method",
      "The inner method joins the existing transaction directly",
      "An exception is thrown because nested transactions are disallowed",
      "The outer transaction commits immediately before continuing"
    ],
    a: 0,
    e: "Propagation.REQUIRES_NEW always starts an independent transaction, suspending any existing transaction. If the inner transaction fails and rolls back, the outer transaction can still catch the error and decide whether to commit."
  },
  {
    q: "If Method A calls Method B in the SAME bean, and Method B has '@Transactional(propagation = Propagation.REQUIRES_NEW)', why does REQUIRES_NEW fail to create a new transaction?",
    o: [
      "Self-invocation bypasses the Spring AOP proxy; Method B is called directly on 'this' rather than through the transactional proxy",
      "Database JDBC drivers do not support inner transactions",
      "Spring only allows one transaction per Java thread forever",
      "REQUIRES_NEW only works in XML configuration"
    ],
    a: 0,
    e: "Spring's @Transactional uses dynamic proxies. Intra-class calls (this.methodB()) bypass the proxy interceptor entirely. To apply proxy advice, Method B must be moved to a separate bean or self-injected via ObjectProvider."
  }
]);

// sb14: Transactional (Part 3) - Rollback Rules & Isolation
QB.add("sb14", [
  {
    q: "By default, for which types of throwables will Spring's '@Transactional' roll back the transaction?",
    o: [
      "Only unchecked exceptions (subclasses of RuntimeException and Error); checked Exceptions do NOT trigger rollback by default",
      "All throwables including checked exceptions",
      "Only java.lang.NullPointerException",
      "Only java.sql.SQLException"
    ],
    a: 0,
    e: "By default, Spring rolls back transactions only on RuntimeException and Error. A checked exception (e.g. IOException, Exception) causes the transaction to commit unless explicitly configured: @Transactional(rollbackFor = Exception.class)."
  }
]);

// sb15: Async Annotation (Part 1)
QB.add("sb15", [
  {
    q: "What prerequisite is required to enable asynchronous method execution with '@Async' in a Spring Boot application?",
    o: [
      "Adding '@EnableAsync' on a @Configuration class",
      "Inheriting from java.lang.Thread in all controllers",
      "Installing an external RabbitMQ message broker",
      "Compiling with the -async javac flag"
    ],
    a: 0,
    e: "@EnableAsync activates Spring's AsyncAnnotationBeanPostProcessor, which wraps @Async-annotated beans with an advisor to run target methods in a separate TaskExecutor thread."
  }
]);

// sb16: Async Annotation (Part 2) - Executor & Exceptions
QB.add("sb16", [
  {
    q: "Why is it dangerous to use '@Async' without defining a custom ThreadPoolTaskExecutor bean?",
    o: [
      "By default, Spring may fall back to SimpleAsyncTaskExecutor, which spawns a new unpooled thread for every single task, risking OutOfMemoryError under load",
      "The methods will execute synchronously on the main thread",
      "Async execution will throw a NoSuchBeanDefinitionException",
      "It locks all database tables"
    ],
    a: 0,
    e: "SimpleAsyncTaskExecutor does not reuse threads; it creates a new operating system thread for each invocation. In production, always register a custom ThreadPoolTaskExecutor with bounded queueCapacity and maxPoolSize."
  }
]);

// sb17: Custom Interceptors
QB.add("sb17", [
  {
    q: "How does a Spring MVC 'HandlerInterceptor' differ from a standard Java Servlet 'Filter'?",
    o: [
      "Filters are part of the Servlet container and wrap the DispatcherServlet; HandlerInterceptors are part of Spring MVC and have access to the target HandlerMethod and ModelAndView",
      "Filters run after the controller returns; Interceptors run before the request arrives at Tomcat",
      "Filters can only be written in XML",
      "Interceptors cannot read request headers"
    ],
    a: 0,
    e: "Filters are servlet container level and process all requests before they hit DispatcherServlet. Interceptors sit inside Spring MVC, intercepting requests between DispatcherServlet and the Controller HandlerMethod."
  }
]);

// sb19: HATEOAS
QB.add("sb19", [
  {
    q: "What is the primary architectural principle of HATEOAS in RESTful web services?",
    o: [
      "The client interacts with the network application entirely through hypermedia links provided dynamically in server responses",
      "All API endpoints must return HTML rather than JSON",
      "The client hardcodes all URLs in a mobile app configuration file",
      "APIs must use SOAP XML schemas"
    ],
    a: 0,
    e: "HATEOAS (Hypermedia As The Engine Of Application State) means the REST client navigates available actions dynamically via hypermedia links (e.g. '_links': { 'self': ..., 'cancel': ... }) returned in the payload."
  }
]);

// sb20: Response Entity & HTTP Status Codes
QB.add("sb20", [
  {
    q: "When a RESTful resource is successfully created via POST, what HTTP status code and response header should be returned according to RFC 9110?",
    o: [
      "201 Created, accompanied by a 'Location' header containing the URI of the newly created resource",
      "200 OK with no headers",
      "204 No Content",
      "302 Found redirecting to homepage"
    ],
    a: 0,
    e: "A successful POST creation should respond with HTTP 201 Created and include the 'Location: /api/orders/123' header pointing to the new resource."
  }
]);

// sb21: Exception Handling (HW)
QB.add("sb21", [
  {
    q: "In Spring Boot 3 / Spring 6, what RFC standard is implemented by the 'ProblemDetail' specification for API error responses?",
    o: [
      "RFC 7807 (Problem Details for HTTP APIs)",
      "RFC 2616 (HTTP 1.1)",
      "RFC 7519 (JSON Web Tokens)",
      "RFC 6749 (OAuth 2.0)"
    ],
    a: 0,
    e: "ProblemDetail implements RFC 7807, providing a standardized JSON format for machine-readable errors with fields: type, title, status, detail, instance, and custom properties."
  }
]);

// sb21_2: Exception Handling (Orig)
QB.add("sb21_2", [
  {
    q: "How does '@ControllerAdvice' combined with '@ExceptionHandler' centralize error handling in Spring Web?",
    o: [
      "It intercepts exceptions thrown across all @RequestMapping controller methods, converting them into uniform error payloads without duplicating try-catch blocks",
      "It catches OutOfMemoryErrors in the JVM",
      "It catches compile-time syntax errors",
      "It automatically retries failed database transactions"
    ],
    a: 0,
    e: "@ControllerAdvice acts as an interceptor of exceptions thrown by any controller method, delegating to matching @ExceptionHandler methods to format consistent JSON error responses."
  }
]);

// sb23: JPA Setup and Architecture
QB.add("sb23", [
  {
    q: "What role does the 'PersistenceContext' play in Hibernate / JPA?",
    o: [
      "It acts as a first-level cache (L1 cache) and identity map ensuring each database row is represented by only one entity instance per transaction",
      "It writes raw SQL logs to a remote file server",
      "It handles TLS certificate encryption",
      "It is an external distributed Redis cluster"
    ],
    a: 0,
    e: "The PersistenceContext is an in-memory identity map and L1 cache managed by EntityManager. It tracks dirty entity state and flushes modifications to the database when the transaction commits."
  }
]);

// sb25: JPA L2 Caching
QB.add("sb25", [
  {
    q: "How does JPA's Second-Level Cache (L2 Cache) differ from the First-Level Cache (L1 Cache)?",
    o: [
      "L1 is bound to a single EntityManager/Session transaction; L2 is shared across all sessions and transactions throughout the entire ApplicationContext (or cluster)",
      "L1 is stored on hard drive; L2 is in RAM",
      "L2 cache is enabled by default in all Spring Boot apps without configuration",
      "L1 cache caches SQL queries; L2 caches HTML files"
    ],
    a: 0,
    e: "L1 cache is transaction-scoped and destroyed when the EntityManager closes. L2 cache (e.g. Ehcache, Hazelcast, Redisson) is SessionFactory-scoped, surviving across multiple user sessions and requests."
  }
]);

// sb26: JPA DTO to Table
QB.add("sb26", [
  {
    q: "What is the primary performance benefit of using constructor-based JPQL DTO projections ('SELECT new com.example.UserDTO(u.id, u.name) FROM User u')?",
    o: [
      "It fetches only the requested columns from the database, bypassing Hibernate dirty-checking and entity lifecycle tracking overhead",
      "It automatically runs on multiple CPU cores",
      "It encrypts the database columns on the wire",
      "It stores the results in the browser's local storage"
    ],
    a: 0,
    e: "DTO projections select only the required database columns, drastically reducing network I/O and memory usage while skipping the Hibernate persistence context entity-management overhead."
  }
]);

// sb27: JPA One to One
QB.add("sb27", [
  {
    q: "Why does '@OneToOne(fetch = FetchType.LAZY)' on the non-owning (inverse) side of a bidirectional relationship still trigger an eager SELECT query?",
    o: [
      "Hibernate bytecode proxy cannot determine whether the child reference should be 'null' or a proxy without querying the child foreign key column",
      "FetchType.LAZY is not supported by MySQL",
      "Spring Boot disables lazy loading for all OneToOne relationships",
      "The Java garbage collector forces early initialization"
    ],
    a: 0,
    e: "Because foreign keys live on the owning side, the parent table has no column indicating whether a child exists. Hibernate must execute a query to check for existence before deciding whether to assign null or a proxy."
  }
]);

// sb29: JPA Derived Queries and JPQL
QB.add("sb29", [
  {
    q: "How does 'JOIN FETCH' in a JPQL query resolve the classic 'N+1 Select Problem'?",
    o: [
      "It forces the persistence provider to retrieve the parent and associated child entities in a single SQL query using an INNER/LEFT JOIN",
      "It caches all child records in the browser",
      "It executes N parallel background threads to fetch each child",
      "It converts the relational database into a graph database"
    ],
    a: 0,
    e: "Without JOIN FETCH, accessing child collections on N parents triggers 1 initial query + N separate child queries (N+1 queries). JOIN FETCH pulls both parent and related entities in a single SQL JOIN query."
  }
]);

// sb30: JPA Native & Criteria API
QB.add("sb30", [
  {
    q: "What is the primary advantage of JPA Criteria API over raw Native SQL queries?",
    o: [
      "Criteria API provides compile-time type-safety and refactoring support for dynamic queries, eliminating runtime syntax errors",
      "Criteria API is always 10x faster than native SQL",
      "Criteria API bypasses database connection pools",
      "Criteria API does not require a database schema"
    ],
    a: 0,
    e: "The Criteria API uses Java Metamodel classes to construct queries programmatically with complete compile-time type safety, making it ideal for dynamic search filters with multiple optional parameters."
  }
]);

// sb32: Attacks & Web Vulnerabilities
QB.add("sb32", [
  {
    q: "How do PreparedStatement and Spring Data JPA repositories defend applications against SQL Injection (SQLi)?",
    o: [
      "By separating query structure from user parameters, transmitting variables via parameterized placeholders ('?') so input is treated strictly as literal data rather than executable code",
      "By stripping all whitespace from user input",
      "By encrypting the entire HTTP POST body with RSA",
      "By running queries only inside Docker containers"
    ],
    a: 0,
    e: "Prepared statements compile the SQL query template first on the database engine. User parameters are supplied separately across binary protocols, making it structurally impossible for malicious input to alter query syntax."
  }
]);

// sb33: Spring Security Setup
QB.add("sb33", [
  {
    q: "In modern Spring Security 6 (Spring Boot 3), how is security configuration declared without extending the deprecated 'WebSecurityConfigurerAdapter'?",
    o: [
      "By declaring a '@Bean public SecurityFilterChain securityFilterChain(HttpSecurity http)' method",
      "By editing web.xml in the WEB-INF folder",
      "By annotating every class with @SecureAll",
      "By configuring iptables rules on Linux"
    ],
    a: 0,
    e: "Spring Security 5.7+ deprecated WebSecurityConfigurerAdapter in favor of component-based configuration: registering a SecurityFilterChain bean using HttpSecurity fluent lambdas."
  }
]);

// sb34: Spring Security Multiple Users
QB.add("sb34", [
  {
    q: "Which Spring Security interface must be implemented to load user authentication credentials and granted authorities from a custom database?",
    o: [
      "UserDetailsService (method: loadUserByUsername(String username))",
      "AuthenticationManagerBuilder",
      "SecurityContextRepository",
      "GrantedAuthorityFactory"
    ],
    a: 0,
    e: "UserDetailsService has a single method: loadUserByUsername(String). Spring Security calls this during authentication to retrieve the UserDetails object (hashed password, roles, account lock flags)."
  }
]);

// sb36: Spring Security Basic Auth
QB.add("sb36", [
  {
    q: "How are credentials transmitted in the HTTP 'Authorization' header when using HTTP Basic Authentication?",
    o: [
      "'Basic ' followed by the Base64-encoded string of 'username:password'",
      "A 256-bit SHA-2 hash of the username",
      "An encrypted asymmetric RSA private key",
      "A plain JSON payload in the request body"
    ],
    a: 0,
    e: "Basic Auth encodes 'username:password' using Base64 (e.g. 'Authorization: Basic YWRtaW46c2VjcmV0'). Because Base64 is trivial to decode, Basic Auth must always be served over HTTPS/TLS."
  }
]);

// sb39: Spring Security OAuth2 / OIDC
QB.add("sb39", [
  {
    q: "Why is the Authorization Code Flow with PKCE (Proof Key for Code Exchange) recommended for modern single-page apps (SPAs) and mobile clients over the legacy Implicit Flow?",
    o: [
      "PKCE prevents authorization code interception attacks without requiring a client secret on public clients that cannot securely store secrets",
      "PKCE eliminates the need for user passwords entirely",
      "PKCE runs faster because it bypasses SSL/TLS",
      "Implicit flow requires an enterprise hardware dongle"
    ],
    a: 0,
    e: "Public clients cannot securely store a client_secret. PKCE uses a dynamically generated code_verifier and code_challenge hash to verify that the client requesting tokens is the exact same client that initiated authorization."
  }
]);

// sb41: Spring Security Method Security
QB.add("sb41", [
  {
    q: "What annotation enables method-level access control such as @PreAuthorize in Spring Boot 3?",
    o: [
      "@EnableMethodSecurity",
      "@EnableGlobalMethodSecurity(prePostEnabled = true) [Legacy]",
      "@SecuredMethodConfig",
      "@EnableWebSecurity"
    ],
    a: 0,
    e: "In Spring Security 6, @EnableMethodSecurity is the new standard (replacing @EnableGlobalMethodSecurity). It enables @PreAuthorize, @PostAuthorize, @PreFilter, and @PostFilter using Spring Expression Language (SpEL)."
  }
]);

// sb43: ConfigurationProperties
QB.add("sb43", [
  {
    q: "What is the primary benefit of '@ConfigurationProperties' over injecting individual properties using '@Value'?",
    o: [
      "It provides strong type-safety, hierarchical grouping of configuration, JSR-380 bean validation (@Validated), and relaxed property binding",
      "It encrypts configuration files on disk",
      "It allows properties to be downloaded from torrent trackers",
      "It restarts the JVM whenever a property changes"
    ],
    a: 0,
    e: "@ConfigurationProperties binds structured YAML/properties directly to POJOs with full type-safety, supports nested objects and collections, supports relaxed binding (kebab-case to camelCase), and works with Hibernate Validator."
  }
]);
