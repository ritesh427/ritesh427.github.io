'use strict';
/* =========================================================
   DevPath Question Bank: Microservices & Cloud-Native
   ========================================================= */

// ms1 & ms2 & ms3: REST Clients (RestTemplate, RestClient, FeignClient)
QB.add("ms1", [
  {
    q: "Why did Spring Framework 6 introduce RestClient alongside RestTemplate?",
    o: [
      "RestClient provides a modern, fluent, functional synchronous HTTP client API while keeping the proven synchronous infrastructure of RestTemplate",
      "RestTemplate was completely removed in Java 17",
      "RestClient executes non-blocking reactive streams exclusively",
      "RestClient requires a WebFlux netty server to function"
    ],
    a: 0,
    e: "Spring 6 / Boot 3 introduced RestClient to offer the intuitive fluent API of WebClient (uri(), header(), body(), retrieve()) while operating synchronously on top of standard HTTP client libraries without needing reactive dependencies."
  },
  {
    q: "In OpenFeign, what is the purpose of FallbackFactory<T> compared to a simple fallback class?",
    o: [
      "FallbackFactory receives the root cause Throwable/Exception that triggered the failure, enabling context-aware fallback decisions and logging",
      "FallbackFactory runs on the client's GPU for faster inference",
      "Simple fallback classes only support XML responses",
      "FallbackFactory bypasses the circuit breaker entirely"
    ],
    a: 0,
    e: "With FallbackFactory, you implement create(Throwable cause). This provides access to the exact exception (e.g. 404 vs 500 vs ConnectTimeout) to tailor user error messages or default responses."
  }
]);

// ms4: Service Discovery (Eureka)
QB.add("ms4", [
  {
    q: "What is 'Self-Preservation Mode' in Netflix Eureka Server?",
    o: [
      "If the percentage of missed instance heartbeats drops below threshold (e.g. 85%), Eureka stops evicting instances to prevent dropping healthy services during network partitions",
      "Eureka shuts down all microservices to preserve memory",
      "Instances delete their own local registry cache",
      "The server restarts automatically after 15 minutes"
    ],
    a: 0,
    e: "During a network partition between Eureka and microservices, instances are usually still healthy and communicating with each other. Self-preservation prevents Eureka from purging the entire cluster registry."
  },
  {
    q: "How do microservices consuming Eureka minimize latency on inter-service calls?",
    o: [
      "Clients cache a local read-only copy of the service registry in memory and refresh it periodically (e.g. every 30s) rather than pinging Eureka on every call",
      "Clients query Eureka via UDP broadcast on every HTTP call",
      "Clients hardcode the remote IP addresses in their bytecode",
      "Eureka establishes a persistent WebSocket connection to every browser"
    ],
    a: 0,
    e: "Eureka clients fetch the full registry at boot and delta updates periodically. Routing decisions happen in-memory on the client without a roundtrip network hop to Eureka."
  }
]);

// ms6: Rate Limiter Pattern
QB.add("ms6", [
  {
    q: "How does the Token Bucket algorithm differ from the Leaky Bucket algorithm in API rate limiting?",
    o: [
      "Token Bucket allows controlled bursty traffic up to bucket capacity; Leaky Bucket smooths and processes traffic at a strictly constant rate",
      "Leaky Bucket allows infinite bursts; Token Bucket drops all traffic over 10 QPS",
      "Token Bucket only works with UDP; Leaky Bucket with TCP",
      "Token Bucket is only for client-side load balancing"
    ],
    a: 0,
    e: "Token Bucket accumulates tokens up to capacity; a burst of requests can consume multiple tokens instantly. Leaky Bucket queues requests and releases them at an unvarying fixed output rate."
  },
  {
    q: "In distributed microservices spanning multiple container instances, how is global rate limiting reliably coordinated?",
    o: [
      "Using Redis with atomic Lua scripts or Redis cell (token bucket) shared by API Gateways",
      "Storing token counts in an in-memory Java ConcurrentHashMap on each instance",
      "Writing counter files to an NFS mount",
      "Relying on client-side JavaScript cookies"
    ],
    a: 0,
    e: "In-memory rate limiters on individual nodes cannot enforce a global cluster quota (e.g., 10,000 QPS total). A centralized, low-latency datastore like Redis running atomic Lua scripts guarantees consistency across nodes."
  }
]);

// ms7: Bulkhead Pattern
QB.add("ms7", [
  {
    q: "What architectural problem does the Bulkhead Pattern resolve in distributed systems?",
    o: [
      "Prevents a slow or hanging downstream dependency from exhausting all available worker threads and crashing the entire caller service",
      "Compresses large JSON payloads over HTTP",
      "Encrypts traffic between Docker containers",
      "Synchronizes database schemas automatically"
    ],
    a: 0,
    e: "Named after watertight compartments in ships. By isolating resources (e.g., dedicated thread pools per external client), a catastrophic outage in Payment Service cannot consume the Order Service's entire thread pool."
  },
  {
    q: "What are the two primary implementation strategies for Bulkheads in Resilience4j?",
    o: [
      "Semaphore Bulkhead (limits concurrent executions without thread switching) and ThreadPool Bulkhead (isolated bounded thread pool with queue)",
      "Mutex Bulkhead and Spinlock Bulkhead",
      "CPU Bulkhead and GPU Bulkhead",
      "Synchronous Bulkhead and Reactive Bulkhead"
    ],
    a: 0,
    e: "Semaphore Bulkhead controls concurrent entries using atomic permits on caller threads (lightweight). ThreadPool Bulkhead offloads calls to dedicated worker threads with queue capacity, providing true thread isolation."
  }
]);

// ms9: Circuit Breaker Pattern (Resilience4j)
QB.add("ms9", [
  {
    q: "What are the three core states of a Circuit Breaker, and what transitions occur between them?",
    o: [
      "CLOSED (normal traffic) -> failure threshold exceeded -> OPEN (fast-fail without calling remote) -> wait duration -> HALF_OPEN (probe trial calls) -> CLOSED or OPEN",
      "ACTIVE -> IDLE -> TERMINATED",
      "CONNECTING -> CONNECTED -> DISCONNECTED",
      "READ -> WRITE -> REPLAY"
    ],
    a: 0,
    e: "CLOSED: calls pass through. When failure rate exceeds threshold (e.g. 50%), it trips to OPEN, fast-failing immediately. After waitDurationInOpenState, it enters HALF_OPEN to test if downstream recovered."
  },
  {
    q: "What is 'slow call rate threshold' in a modern Resilience4j Circuit Breaker?",
    o: [
      "The percentage of calls taking longer than slowCallDurationThreshold; if exceeded, the circuit trips to OPEN even if the calls ultimately return HTTP 200",
      "The time it takes to compile the Java bytecode",
      "A penalty applied to clients on cellular networks",
      "The time a service waits before rebooting"
    ],
    a: 0,
    e: "Slow calls are often more dangerous than fast errors because they tie up server thread pools and database connections. Resilience4j treats excessive high-latency calls as failures."
  }
]);

// ms10: API Gateway
QB.add("ms10", [
  {
    q: "How does Spring Cloud Gateway differ architecturally from the legacy Netflix Zuul 1.x gateway?",
    o: [
      "Spring Cloud Gateway is built on non-blocking Netty and Spring WebFlux; Zuul 1.x was blocking/synchronous based on Servlet APIs (thread-per-connection)",
      "Spring Cloud Gateway only supports SOAP/XML",
      "Zuul 1.x was faster because it did not use reactive streams",
      "Spring Cloud Gateway cannot perform routing or filtering"
    ],
    a: 0,
    e: "Spring Cloud Gateway leverages non-blocking event-loop architecture (Project Reactor + Netty). This allows thousands of concurrent long-lived connections with minimal thread overhead compared to thread-per-request servlet containers."
  },
  {
    q: "In Spring Cloud Gateway, what are the three foundational building blocks of a route?",
    o: [
      "ID, Predicates (matching path/headers/query), and Filters (modifying request/response headers or bodies)",
      "Source, Destination, and Port",
      "URL, IP address, and MAC address",
      "Servlet, FilterChain, and Dispatcher"
    ],
    a: 0,
    e: "A route is defined by: a unique ID, Predicates that evaluate boolean conditions against the incoming ServerWebExchange, and Filters that inspect or mutate the request and response."
  }
]);

// ms12 & ms13: Centralized Config & Refresh Scope
QB.add("ms12", [
  {
    q: "What does the @RefreshScope annotation do in a Spring Cloud microservice?",
    o: [
      "Re-creates and re-injects the bean dynamically when a RefreshEvent is fired without restarting the JVM process",
      "Refreshes the user's browser page via WebSocket",
      "Forces a garbage collection cycle every 60 seconds",
      "Reloads static HTML and CSS files from disk"
    ],
    a: 0,
    e: "Beans annotated with @RefreshScope are lazily initialized target proxies. When /actuator/refresh is triggered, the beans are cleared from the internal scope cache and recreated with updated properties upon next call."
  },
  {
    q: "How does Spring Cloud Bus distribute configuration changes across 50 microservice instances without pinging /actuator/refresh on all 50 manually?",
    o: [
      "A single POST to /actuator/busrefresh broadcasts a RefreshRemoteApplicationEvent over a shared message broker (Kafka or RabbitMQ) to all connected instances",
      "Instances scan the Git repository every 500 milliseconds",
      "The Config Server uses SSH to execute terminal commands on all pods",
      "By restarting the Kubernetes cluster automatically"
    ],
    a: 0,
    e: "Spring Cloud Bus links distributed nodes via a lightweight message broker. Emitting /actuator/busrefresh to one node publishes an event to the topic, notifying all cluster instances to reload configuration simultaneously."
  }
]);

// ms15: Distributed Tracing
QB.add("ms15", [
  {
    q: "What is the relationship between a Trace ID and a Span ID in distributed tracing (e.g. OpenTelemetry, Micrometer Tracing)?",
    o: [
      "A Trace ID represents the entire end-to-end user request path across all services; a Span ID represents a single contiguous unit of work or hop within one service",
      "Trace ID is used only for SQL queries; Span ID is for HTTP requests",
      "They are identical integers that change on every method call",
      "Span ID is the parent of Trace ID"
    ],
    a: 0,
    e: "A Trace ID is created at the ingress gateway and passed downstream via HTTP headers (W3C traceparent). Each service creates its own Span ID linked to the global Trace ID, forming a distributed acyclic call graph."
  },
  {
    q: "What standard HTTP header format is recommended by the W3C for propagating distributed trace contexts across heterogeneous systems?",
    o: [
      "traceparent (e.g. 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01)",
      "X-B3-TraceId and X-B3-SpanId only",
      "Authorization-Trace-Header",
      "Cookie: trace_session_id"
    ],
    a: 0,
    e: "W3C Trace Context standardizes the 'traceparent' header (version-traceid-parentid-traceflags). This replaces vendor-specific headers like Zipkin's B3 headers."
  }
]);

// ms20: Distributed Scheduler
QB.add("ms20", [
  {
    q: "When running 4 replicas of a Spring Boot microservice with a @Scheduled cron task, what problem occurs and how does ShedLock solve it?",
    o: [
      "Without coordination, all 4 instances execute the scheduled job simultaneously; ShedLock uses a centralized distributed lock (e.g. in DB or Redis) so only one node executes each run",
      "The JVM crashes with a PortInUseException",
      "Only the first instance receives network traffic",
      "Kubernetes terminates 3 of the 4 pods automatically"
    ],
    a: 0,
    e: "ShedLock stores a lock record with expiration in an external database or Redis. Before invoking the @Scheduled method, an instance attempts to acquire the lock; if another node holds it, the run is skipped."
  }
]);

// ms2: RestClient (Spring 6 / Boot 3)
QB.add("ms2", [
  {
    q: "How do you configure custom error handling for 4xx and 5xx responses using Spring 6's fluent RestClient?",
    o: [
      "Using the .onStatus(predicate, errorHandler) fluent method on the response specification",
      "By registering a legacy ResponseExtractor bean",
      "By catching raw SocketException in a try-catch block",
      "RestClient automatically ignores all HTTP errors by default"
    ],
    a: 0,
    e: "RestClient provides .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> { throw new CustomNotFoundException(res.getStatusText()); }), providing a clean and declarative way to handle error codes."
  },
  {
    q: "How does RestClient achieve connection pooling and request timeouts under the hood?",
    o: [
      "By configuring an underlying ClientHttpRequestFactory (such as Apache HttpComponents or Java 11 HttpClient) when building the RestClient",
      "RestClient uses Java Reflection to bypass OS network sockets",
      "Timeouts are managed by operating system cron jobs",
      "Connection pooling is not supported in synchronous REST clients"
    ],
    a: 0,
    e: "RestClient.builder().requestFactory(new JdkClientHttpRequestFactory(...)) or HttpComponentsClientHttpRequestFactory configures connection pooling, connect timeouts, and read timeouts."
  }
]);

// ms3: OpenFeign Client Advanced
QB.add("ms3", [
  {
    q: "How can you dynamically propagate an incoming JWT Bearer token across downstream microservice calls using OpenFeign?",
    o: [
      "By implementing a RequestInterceptor bean that retrieves the SecurityContextHolder token and adds the 'Authorization: Bearer <token>' header to RequestTemplate",
      "By passing the JWT token as a query parameter on every method",
      "By storing the JWT in an environment variable",
      "Feign automatically forwards all HTTP headers without configuration"
    ],
    a: 0,
    e: "RequestInterceptor is invoked before each Feign request is sent. It inspects the current HttpServletRequest or SecurityContextHolder and injects the Authorization header into template.header('Authorization', token)."
  },
  {
    q: "What Feign Logger Level provides the complete HTTP request and response headers, body payloads, and metadata for debugging?",
    o: [
      "Logger.Level.FULL",
      "Logger.Level.BASIC",
      "Logger.Level.NONE",
      "Logger.Level.HEADERS"
    ],
    a: 0,
    e: "Feign Logger.Level supports: NONE (default), BASIC (request method, URL, response status, execution time), HEADERS (basic + request/response headers), and FULL (headers, body, and metadata for both request and response)."
  }
]);

// ms5: Client Side Load Balancer
QB.add("ms5", [
  {
    q: "What replaced Netflix Ribbon as the standard client-side load balancer in modern Spring Cloud?",
    o: [
      "Spring Cloud LoadBalancer (reactive and non-reactive client-side load balancing built by the Spring team)",
      "NGINX Ingress Controller only",
      "Zuul 1 Proxy",
      "Hardware F5 Big-IP routers"
    ],
    a: 0,
    e: "Netflix Ribbon was put into maintenance mode. Spring Cloud introduced Spring Cloud LoadBalancer as the modern, lightweight replacement supporting round-robin, random, and custom caching load balancer algorithms."
  }
]);

// ms8: Resilience4j Retry
QB.add("ms8", [
  {
    q: "Why is 'Exponential Backoff with Jitter' strongly recommended when configuring Resilience4j Retry for inter-service calls?",
    o: [
      "Jitter introduces randomized delays to prevent the 'Thundering Herd' problem where all retrying instances hammer the recovering service at identical intervals",
      "It disables retries when the server load is high",
      "It converts HTTP requests to UDP packets",
      "It doubles the CPU clock rate during retries"
    ],
    a: 0,
    e: "Exponential backoff increases wait times (e.g. 1s, 2s, 4s, 8s). Adding randomized jitter spreads out incoming retries, allowing an overloaded downstream service or database to recover smoothly."
  }
]);

// ms11: API Gateway Part 2 (Rate Limiting & Security Filters)
QB.add("ms11", [
  {
    q: "In Spring Cloud Gateway, how is distributed Token Bucket rate limiting implemented across multiple gateway instances?",
    o: [
      "Using RequestRateLimiterGatewayFilterFactory backed by RedisRateLimiter and Redis Lua scripts",
      "By storing counter integers in JVM static fields",
      "By writing IP address counters to local text files",
      "Using local Guava RateLimiter on each node"
    ],
    a: 0,
    e: "Spring Cloud Gateway integrates with Redis via Lua scripts implementing the Token Bucket algorithm. Because Redis is centralized and atomic, all gateway instances share the exact same rate limit quota per user/IP."
  }
]);

// ms13: Refresh Scope
QB.add("ms13", [
  {
    q: "What does the @RefreshScope annotation do in a Spring Boot application connected to Spring Cloud Config?",
    o: [
      "It puts a CGLIB proxy around the bean; when /actuator/refresh is called, the bean instance is destroyed and lazily recreated with fresh property values on its next access",
      "It reboots the JVM automatically",
      "It clears the PostgreSQL database tables",
      "It recompiles the Java source files at runtime"
    ],
    a: 0,
    e: "Beans in @RefreshScope act as lazy proxies. Calling POST /actuator/refresh re-reads configuration from the Config Server, evicts the existing bean instance from the scope cache, and re-initializes it with updated values."
  }
]);

// ms14: Cloud Bus
QB.add("ms14", [
  {
    q: "How does Spring Cloud Bus eliminate the need to invoke /actuator/refresh individually on hundreds of microservice instances?",
    o: [
      "It connects all microservice instances via a shared message broker (Kafka or RabbitMQ); sending POST /actuator/busrefresh to one node broadcasts a RefreshRemoteApplicationEvent to all instances",
      "It connects via SSH to all server instances and runs a bash script",
      "It opens socket connections on port 80 to every node sequentially",
      "It uses DNS TXT records to notify servers"
    ],
    a: 0,
    e: "Spring Cloud Bus links nodes with a lightweight message broker. When configurations change in Git, a single webhook call to the bus broadcasts the refresh event across the entire fleet."
  }
]);

// ms16, ms17, ms18, ms19: Distributed Logging & Tracing
QB.add("ms16", [
  {
    q: "How does Mapped Diagnostic Context (MDC) assist in distributed logging within a single microservice?",
    o: [
      "It stores key-value pairs (such as traceId and userId) in ThreadLocal memory so logging frameworks (Logback/Log4j2) automatically append them to every log line printed by that thread",
      "It uploads log files directly to S3 every 10 seconds",
      "It parses SQL statements before execution",
      "It converts log text into encrypted binary files"
    ],
    a: 0,
    e: "SLF4J MDC binds contextual metadata to the current thread. When your logging pattern includes [%X{traceId}], all log statements automatically print the traceId without manually passing it to every logger method."
  }
]);

QB.add("ms17", [
  {
    q: "In distributed tracing (Micrometer Tracing / OpenTelemetry), what is the difference between a TraceId and a SpanId?",
    o: [
      "TraceId represents the entire end-to-end request journey across all microservices; SpanId represents a single unit of work (e.g. one HTTP request or DB query) within that journey",
      "TraceId is local to one service; SpanId is global across all services",
      "TraceId is only used for error logs; SpanId is used for info logs",
      "There is no difference; they are aliases for the same value"
    ],
    a: 0,
    e: "A Trace is a tree of Spans. The TraceId remains constant across the entire transaction lifecycle across dozens of microservices, while each individual network call, database query, or internal task gets a unique SpanId."
  }
]);

QB.add("ms18", [
  {
    q: "What protocol has become the industry standard for exporting metrics, logs, and distributed traces to backends like Jaeger, Zipkin, and Prometheus?",
    o: [
      "OTLP (OpenTelemetry Protocol), operating over gRPC or HTTP using Protocol Buffers",
      "SNMP (Simple Network Management Protocol)",
      "FTP upload of CSV records",
      "Raw Telnet connections"
    ],
    a: 0,
    e: "OpenTelemetry Protocol (OTLP) standardizes telemetry data models and transmission mechanisms across observability vendors, eliminating proprietary agent vendor lock-in."
  }
]);

QB.add("ms19", [
  {
    q: "In an ELK (Elasticsearch, Logstash, Kibana) stack, what is the best practice for formatting application logs in high-throughput microservices?",
    o: [
      "Log in structured JSON format (e.g. using logstash-logback-encoder) to eliminate expensive regex string parsing in Logstash/Elasticsearch ingestion pipelines",
      "Log in unformatted raw multiline plain text",
      "Log everything in XML format",
      "Write logs directly to an Excel spreadsheet"
    ],
    a: 0,
    e: "Emitting structured JSON directly from the application makes ingestion blistering fast: Elasticsearch and Logstash ingest JSON fields directly without CPU-intensive regular expression parsing of multiline stack traces."
  }
]);

// ms21, ms22, ms23: Distributed Scheduler
QB.add("ms21", [
  {
    q: "In ShedLock, why are both 'lockAtMostFor' and 'lockAtLeastFor' parameters essential on @SchedulerLock?",
    o: [
      "lockAtMostFor guarantees the lock is released if a node crashes; lockAtLeastFor prevents another node from executing the job if the first node finishes in milliseconds before clock drift passes",
      "They define the minimum and maximum heap memory allocated to the job",
      "They configure HTTP socket timeouts",
      "They set the number of database retries"
    ],
    a: 0,
    e: "lockAtMostFor prevents deadlocks if a node dies mid-job. lockAtLeastFor ensures the lock is held for at least a short duration (e.g. 5s) so slight clock discrepancies don't allow a second node to run the same minute's job."
  }
]);

QB.add("ms22", [
  {
    q: "What is the primary vulnerability of using a single Redis instance with 'SET key value NX PX timeout' as a distributed lock in safety-critical systems?",
    o: [
      "If the lock holder experiences a long GC pause exceeding the lock timeout, the lock auto-releases and another node acquires it, causing two nodes to execute the critical section concurrently",
      "Redis does not support key expiration",
      "Redis is multi-threaded and causes race conditions",
      "SET NX PX is not supported in Redis 7"
    ],
    a: 0,
    e: "Martin Kleppmann highlighted that unexpected GC pauses or network delays can cause TTL to expire while the client still thinks it holds the lock. Robust systems use Fencing Tokens (monotonically increasing IDs verified by the storage layer)."
  }
]);

QB.add("ms23", [
  {
    q: "When implementing a distributed task worker queue using PostgreSQL or MySQL, what SQL clause prevents lock contention and worker blocking?",
    o: [
      "SELECT * FROM tasks WHERE status = 'PENDING' ORDER BY id LIMIT 10 FOR UPDATE SKIP LOCKED",
      "SELECT * FROM tasks WHERE status = 'PENDING' FOR READ ONLY",
      "SELECT ALL FROM tasks UNLOCKED",
      "LOCK TABLE tasks IN EXCLUSIVE MODE"
    ],
    a: 0,
    e: "FOR UPDATE SKIP LOCKED locks selected rows while instructing other concurrent worker transactions to skip locked rows and immediately fetch the next unlocked batch, enabling highly scalable parallel task queues."
  }
]);
