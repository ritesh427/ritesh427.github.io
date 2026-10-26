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
