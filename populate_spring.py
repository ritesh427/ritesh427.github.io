# populate_spring.py - Generates interview-grade questions for 30 missing Spring Boot topics
import os

BANKS_DIR = '/Users/ritesh/Developer/experiments/ritesh427.github.io/js/bank'

spring_extra = '''
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
'''

with open(os.path.join(BANKS_DIR, 'bank_spring.js'), 'a', encoding='utf-8') as f:
    f.write(spring_extra)

print('Successfully appended 30 missing Spring Boot topics to bank_spring.js!')
