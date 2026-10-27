# populate_all_questions.py - Part 1: Microservices, EDA, JUnit5, HLD
import os

BANKS_DIR = '/Users/ritesh/Developer/experiments/ritesh427.github.io/js/bank'

# 1. Microservices Additional Topics
ms_extra = '''
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
'''

# 2. EDA Additional Topics
eda_extra = '''
// eda12: Kafka Consumer Advanced & Rebalance Listeners
QB.add("eda12", [
  {
    q: "Why should you implement ConsumerRebalanceListener.onPartitionsRevoked() when manually managing Kafka consumer offsets?",
    o: [
      "To commit in-flight processed offsets to Kafka synchronously before partition ownership is transferred to another consumer during a rebalance",
      "To delete all messages stored in the partitions",
      "To trigger a JVM garbage collection",
      "To restart the Kafka broker node"
    ],
    a: 0,
    e: "When a rebalance occurs, your consumer loses ownership of its partitions. onPartitionsRevoked() is your last chance to flush state and commit offsets synchronously to prevent duplicate message processing by the new owner."
  },
  {
    q: "How does manual asynchronous commit (commitAsync()) differ from synchronous commit (commitSync()) in KafkaConsumer?",
    o: [
      "commitAsync() is non-blocking and does not retry on failure (to prevent committing stale offsets out of order); commitSync() blocks the thread until broker ACK is received and retries retriable errors",
      "commitSync() sends messages via UDP",
      "commitAsync() only works when Kafka is running in ZooKeeper mode",
      "commitSync() deletes the topic offsets permanently"
    ],
    a: 0,
    e: "commitAsync() does not retry because if commit #1 fails and commit #2 succeeds, retrying commit #1 would overwrite the newer offset with an older one. Best practice: commitAsync() in poll loop, commitSync() in shutdown."
  }
]);

// eda16: Kafka Consumer Transactions & Exactly Once
QB.add("eda16", [
  {
    q: "How does Kafka's Transaction Coordinator prevent 'Zombie Instances' (split-brain producers) from corrupting partition logs?",
    o: [
      "Using an Epoch Number associated with the transactional.id; when a new producer initializes with the same ID, the coordinator bumps the epoch and rejects requests from older epochs with a ProducerFencedException",
      "By rebooting the server operating system",
      "By revoking SSL certificates",
      "By deleting the producer's hard drive log"
    ],
    a: 0,
    e: "Each transactional producer registers with a static transactional.id. The transaction coordinator issues an epoch. If an old producer experiences a network partition and wakes up, any write attempt is rejected with ProducerFencedException."
  }
]);
'''

# 3. JUnit5 & Mockito Additional Topics
junit_extra = '''
// ju5: JUnit 5 Extension Model
QB.add("ju5", [
  {
    q: "How does JUnit 5's Extension model (@ExtendWith) improve upon JUnit 4's @Rule and @ClassRule?",
    o: [
      "It unifies all extension points (parameter resolution, lifecycle interception, exception handling, test execution condition) into a cohesive interface model that supports multiple extensions per test class",
      "It requires all tests to be written in Groovy",
      "It eliminates the need for test assertions",
      "It compiles tests into native C++ binaries"
    ],
    a: 0,
    e: "JUnit 4 rules suffered from limited composability and strict method signature constraints. JUnit 5 extensions implement specific callback interfaces (BeforeEachCallback, ParameterResolver, etc.) and compose seamlessly."
  }
]);

// ju6: Repeated Tests
QB.add("ju6", [
  {
    q: "In JUnit 5, what annotation and parameter resolver allows running a flaky or non-deterministic test multiple times while inspecting the current iteration?",
    o: [
      "@RepeatedTest(value = 5) and injecting RepetitionInfo into the test method",
      "@Loop(count = 5)",
      "@RetryableTest",
      "@Test(repetition = 5)"
    ],
    a: 0,
    e: "@RepeatedTest(10) repeats the test 10 times. You can declare RepetitionInfo in the method signature to inspect repetitionInfo.getCurrentRepetition() and repetitionInfo.getTotalRepetitions()."
  }
]);

// ju9: Assumptions
QB.add("ju9", [
  {
    q: "What happens when an assumption fails (e.g. Assumptions.assumeTrue(isLinux())) in a JUnit 5 test?",
    o: [
      "The test execution is aborted, and the test is marked as SKIPPED/IGNORED (not failed)",
      "The test fails with an AssertionError and breaks the build",
      "The entire test suite terminates immediately",
      "The JVM throws an OutOfMemoryError"
    ],
    a: 0,
    e: "Assumptions evaluate preconditions (like running on a specific OS, database availability, or CI environment). If an assumption fails, TestAbortedException is thrown, causing test runners to mark the test skipped, not failed."
  }
]);

// ju10: Tagging and Filtering
QB.add("ju10", [
  {
    q: "What is the purpose of @Tag in JUnit 5 when running automated builds in Maven or Gradle?",
    o: [
      "It allows categorizing tests (e.g. @Tag('fast'), @Tag('integration')) so build tools can selectively execute or exclude test groups in different CI/CD pipeline stages",
      "It sets the color of the console output",
      "It compresses the test classes into ZIP archives",
      "It encrypts the test class names"
    ],
    a: 0,
    e: "Using maven-surefire-plugin <groups>integration</groups> or <excludedGroups>slow</excludedGroups>, teams run fast unit tests on PR commit and execute slow integration tests on nightly builds."
  }
]);

// ju11: Test Suites
QB.add("ju11", [
  {
    q: "How do you create a structured test suite in JUnit 5 to discover and run specific packages or tag groups?",
    o: [
      "By annotating a class with @Suite and combining it with @SelectPackages or @SelectClasses and @IncludeTags",
      "By creating a shell script named suite.sh",
      "By listing class names in a text file in src/main/resources",
      "By creating multiple main() methods in test classes"
    ],
    a: 0,
    e: "JUnit Platform Suite engine provides @Suite, @SelectPackages('com.example.service'), @SelectClasses(...), and @IncludeTags('smoke') to package and execute test suites programmatically."
  }
]);

// ju12: Dynamic Tests (@TestFactory)
QB.add("ju12", [
  {
    q: "What is a Dynamic Test in JUnit 5 and what must a @TestFactory method return?",
    o: [
      "Tests generated at runtime based on external data or streams; the @TestFactory method must return a Stream, Collection, or Iterable of DynamicNode / DynamicTest",
      "A test that rewrites its own bytecode while executing",
      "A test that can only run inside a Docker container",
      "A test that returns void"
    ],
    a: 0,
    e: "Unlike standard @Test methods compiled statically, @TestFactory produces dynamic test cases at runtime. For example, reading 100 test cases from a JSON file and mapping each to dynamicTest(name, executable)."
  }
]);

// ju13: Mockito Introduction
QB.add("ju13", [
  {
    q: "What default return value does a Mockito mock provide for a method returning an int, boolean, or Object if no stubbing (when().thenReturn()) is defined?",
    o: [
      "int: 0, boolean: false, Object: null, Collections: empty collection",
      "It throws a NullPointerException on every unstubbed invocation",
      "It executes the real production method",
      "It returns a random non-zero value"
    ],
    a: 0,
    e: "Mockito adheres to 'nice mocks': unstubbed method invocations do not fail; they return standard defaults: 0 for numeric primitives, false for booleans, null for objects, and empty instances for Collections/Optionals."
  }
]);

// ju14: Mockito Architecture & ByteBuddy
QB.add("ju14", [
  {
    q: "How does Mockito's modern 'inline-mock-maker' mock final classes, final methods, and static methods without bytecode transformation at classload time?",
    o: [
      "Using ByteBuddy and Java Instrumentation API to modify existing class bytecode in memory (hot-swapping method bodies)",
      "By generating dynamic subclasses using legacy CGLIB",
      "By executing code in a simulated JavaScript runtime",
      "By recompiling source files using javac"
    ],
    a: 0,
    e: "Historically Mockito subclassed target classes, preventing mocking of final classes. The inline mock-maker uses Java Instrumentation and ByteBuddy to transform the bytecode of the class directly in memory."
  }
]);

// ju16: Constructor Injection in Tests
QB.add("ju16", [
  {
    q: "Why is Constructor Injection strongly preferred over @Autowired field injection when writing unit tests for Spring service components?",
    o: [
      "Classes with constructor injection can be instantiated in plain unit tests using 'new Service(mockA, mockB)' without needing reflection, Mockito annotations, or starting a Spring ApplicationContext",
      "Constructor injection is faster because it bypasses the JVM classloader",
      "Field injection causes memory leaks in all Spring versions",
      "Constructor injection eliminates the need for unit tests entirely"
    ],
    a: 0,
    e: "Constructor injection guarantees testability: your class declares its dependencies explicitly in its public contract. You can instantiate it in standard pure Java unit tests in milliseconds without Spring container overhead."
  }
]);
'''

# 4. HLD Additional Topics
hld_extra = '''
// hld3: Microservices Patterns
QB.add("hld3", [
  {
    q: "How does the 'Transactional Outbox Pattern' ensure atomic database updates and event publishing without distributed 2PC transactions?",
    o: [
      "The business entity update and outgoing event message are saved inside the SAME local relational database transaction into an 'outbox' table; a separate CDC process (e.g. Debezium) asynchronously publishes outbox records to Kafka",
      "The application calls Kafka first, and if Kafka succeeds, it commits the database",
      "It uses Two-Phase Commit across Postgres and Kafka",
      "Events are saved in browser local storage"
    ],
    a: 0,
    e: "Dual writes to a database and a message broker always risk partial failure. The Outbox pattern relies on local ACID transactions to write business data and outbox events together, followed by reliable log tailing (CDC) to publish to Kafka."
  },
  {
    q: "What is the primary trade-off between Orchestration-based Sagas and Choreography-based Sagas in distributed systems?",
    o: [
      "Orchestration centralizes workflow logic in a saga coordinator service (clearer state, easier testing, but central dependency); Choreography uses event-driven pub/sub between services (loose coupling, but complex debugging and cyclic dependency risks)",
      "Orchestration uses UDP; Choreography uses TCP",
      "Choreography requires a relational database; Orchestration does not",
      "Orchestration is only supported in Java"
    ],
    a: 0,
    e: "In Choreography, services react to each other's events. When flows grow to 8+ steps, tracking state becomes difficult. Orchestration provides a stateful coordinator (e.g. Temporal, Camunda, AWS Step Functions) that explicitly commands each step."
  }
]);

// hld5: Scale from 0 to Million
QB.add("hld5", [
  {
    q: "When scaling an application from 10,000 to 1,000,000 daily active users, what architectural transition is crucial for the web/application tier?",
    o: [
      "Making the web tier completely stateless so user sessions are stored in an external distributed cache (Redis) or JWTs, allowing horizontal autoscaling behind a load balancer",
      "Upgrading the server to a 128-core mainframe with 2TB of RAM",
      "Storing all user sessions on the web server's local file system",
      "Disabling all database indexes"
    ],
    a: 0,
    e: "Stateful servers require 'sticky sessions', preventing elastic horizontal scaling. Stateless servers treat instances as cattle: any node can service any request, enabling seamless auto-scaling up and down based on traffic."
  }
]);

// hld8: Back of the envelope estimation
QB.add("hld8", [
  {
    q: "If a system handles 100 Million daily active users, with each user generating 5 requests per day, what is the approximate average Queries Per Second (QPS)?",
    o: [
      "~5,800 QPS (100M * 5 = 500M requests / 86,400 seconds ~= 5,787 QPS; with peak factor of 2-3x = ~15,000 QPS)",
      "~500,000 QPS",
      "~50 QPS",
      "~1,000,000 QPS"
    ],
    a: 0,
    e: "A standard interview shortcut is rounding a day to ~86,400 -> 100,000 seconds. 500,000,000 / 86,400 ~= 5,800 average QPS. System capacity should typically be planned for 2x-3x peak traffic (~12,000 - 18,000 peak QPS)."
  }
]);

// hld10: SQL vs NoSQL
QB.add("hld10", [
  {
    q: "Under what workload characteristics is an Apache Cassandra (Wide-Column NoSQL) database superior to PostgreSQL?",
    o: [
      "Massive write-heavy append workloads (e.g. IoT telemetry, chat messages) distributed across multi-datacenter clusters requiring high availability with linear write scaling and no single point of failure",
      "Complex multi-table financial transactions requiring ACID joins and foreign keys",
      "Systems with small datasets under 10 Gigabytes",
      "Applications requiring dynamic arbitrary SQL ad-hoc queries"
    ],
    a: 0,
    e: "Cassandra's masterless LSM-tree architecture delivers blistering write throughput and zero-downtime multi-datacenter replication. However, it sacrifices ACID joins, foreign keys, and arbitrary ad-hoc filtering."
  }
]);

// hld12: Rate Limiter
QB.add("hld12", [
  {
    q: "Why is the Sliding Window Counter algorithm generally preferred over Fixed Window in production rate limiters?",
    o: [
      "Fixed Window allows double the allowed traffic burst at the boundary edge (e.g. 100 requests at 00:59 and 100 requests at 01:00); Sliding Window smooths traffic across overlapping window boundaries",
      "Sliding Window uses 10x less memory than Fixed Window",
      "Fixed Window requires atomic clocks",
      "Sliding Window can only run in C++"
    ],
    a: 0,
    e: "Fixed Window resets at minute marks, allowing a burst of 2x the limit across the boundary. Sliding Window Counter weights the previous window's requests with the current window's elapsed percentage, preventing boundary spikes."
  }
]);

// hld15: High Availability System
QB.add("hld15", [
  {
    q: "In high availability distributed clustering, what is 'Split-Brain' and how is it prevented?",
    o: [
      "When a network partition divides a cluster and both halves believe the other is dead, electing their own leaders; prevented by requiring a Strict Quorum (majority vote: N/2 + 1) for any leader election",
      "When a CPU dual-core processor overheats",
      "When an engineer deploys two different code versions simultaneously",
      "When database tables have duplicated primary keys"
    ],
    a: 0,
    e: "If two nodes both think they are leader, data diverges irreversibly. Quorum consensus ensures that only the network partition containing more than 50% of the nodes can elect a leader, rendering the minority partition read-only."
  }
]);

// hld16: Distributed Messaging Queue
QB.add("hld16", [
  {
    q: "What is the architectural difference in message consumption between RabbitMQ (AMQP) and Apache Kafka?",
    o: [
      "RabbitMQ uses a broker-centric 'smart broker / dumb consumer' push model where messages are deleted once acknowledged; Kafka uses a 'dumb broker / smart consumer' pull model where immutable logs persist on disk",
      "RabbitMQ only runs on Windows; Kafka only runs on Linux",
      "Kafka does not support consumer groups",
      "RabbitMQ stores messages for 7 years by default"
    ],
    a: 0,
    e: "RabbitMQ tracks per-message ACK states and deletes consumed messages. Kafka is an append-only commit log: consumers track their own offsets and pull messages at their own pace, enabling replayability and high throughput."
  }
]);

// hld17: Proxy vs Reverse Proxy
QB.add("hld17", [
  {
    q: "What is the difference between a Forward Proxy and a Reverse Proxy?",
    o: [
      "A Forward Proxy sits in front of clients and intercepts outbound requests to the internet (providing anonymity, filtering, caching); a Reverse Proxy sits in front of servers and intercepts inbound requests (providing load balancing, SSL termination, and caching)",
      "Forward proxies only handle HTTP; Reverse proxies only handle FTP",
      "Reverse proxies are hardware only",
      "Forward proxies protect backend servers from DDoS attacks"
    ],
    a: 0,
    e: "Forward proxies protect and represent clients (e.g. corporate internet egress proxy). Reverse proxies protect and represent servers (e.g. NGINX, Cloudflare, HAProxy)."
  }
]);

// hld18: Load Balancers (L4 vs L7)
QB.add("hld18", [
  {
    q: "How does a Layer 4 (Transport) Load Balancer differ from a Layer 7 (Application) Load Balancer?",
    o: [
      "Layer 4 routes packets based on IP and TCP/UDP ports without inspecting payload; Layer 7 terminates the HTTP connection and routes based on URL paths, HTTP headers, cookies, and body content",
      "Layer 4 is slower than Layer 7",
      "Layer 7 cannot terminate SSL certificates",
      "Layer 4 only works with IPv6"
    ],
    a: 0,
    e: "L4 load balancers (e.g. AWS NLB, IPVS) are ultra-fast packet forwarders with low CPU overhead. L7 load balancers (e.g. AWS ALB, NGINX, Envoy) can make intelligent routing decisions (e.g. /api/orders -> order service) by inspecting HTTP content."
  }
]);

// hld20: Distributed Transactions (2PC vs Sagas)
QB.add("hld20", [
  {
    q: "Why is Two-Phase Commit (2PC) considered an anti-pattern in modern cloud-native distributed microservices?",
    o: [
      "2PC is a blocking protocol: all participating nodes lock resources during the prepare phase; if the coordinator crashes, locks remain held indefinitely, destroying system availability and scalability",
      "2PC does not support relational databases",
      "2PC requires quantum computing hardware",
      "2PC only works on a single computer"
    ],
    a: 0,
    e: "2PC prioritizes strict consistency over availability. In distributed networks with latency and node crashes, 2PC causes cascading lock delays and timeouts. Modern architectures use Sagas with compensating transactions."
  }
]);

// hld22: Concurrency Control
QB.add("hld22", [
  {
    q: "When designing a ticket booking platform (e.g. BookMyShow, Ticketmaster), how does Optimistic Concurrency Control (OCC) prevent seat double-booking?",
    o: [
      "By maintaining a version/status column on the seat row; when booking, execute 'UPDATE seats SET status = 'BOOKED', version = version + 1 WHERE id = :id AND version = :readVersion'; if 0 rows update, reject as conflict",
      "By acquiring a database-wide write lock on the entire tablespace",
      "By disabling multithreading on the web server",
      "By using random thread sleep delays"
    ],
    a: 0,
    e: "OCC assumes conflicts are infrequent. By checking that the version hasn't changed since it was read, the atomic database UPDATE guarantees that only the first transaction commits, while concurrent attempts detect 0 rows updated and abort."
  }
]);

// hld23: Two-Phase Locking (2PL)
QB.add("hld23", [
  {
    q: "In database transaction theory, what is 'Strict Two-Phase Locking' (Strict 2PL)?",
    o: [
      "A protocol where all exclusive (write) locks acquired during transaction execution are held until the transaction commits or aborts, completely preventing cascading aborts",
      "A protocol where transactions can only execute 2 SQL queries",
      "A locking mechanism that uses two physical hard drives",
      "A protocol that eliminates deadlocks completely"
    ],
    a: 0,
    e: "Standard 2PL has a growing phase (acquiring locks) and shrinking phase (releasing locks). If a transaction releases a write lock before committing, other transactions can read uncommitted data, causing cascading rollbacks. Strict 2PL holds write locks until commit."
  }
]);

// hld24: OAuth 2.0 Security
QB.add("hld24", [
  {
    q: "Why is PKCE (Proof Key for Code Exchange) mandatory for public clients (Single-Page Apps, Mobile Apps) using OAuth 2.0 Authorization Code grant?",
    o: [
      "Public clients cannot safely store a client_secret; PKCE creates a dynamic one-time cryptographic code_verifier and code_challenge, preventing authorization code interception attacks",
      "PKCE compresses the access token to 16 bytes",
      "PKCE bypasses the need for HTTPS",
      "PKCE replaces user passwords with biometric face scans"
    ],
    a: 0,
    e: "Mobile apps and SPAs can be decompiled to extract hardcoded secrets. PKCE generates a random code_verifier, hashes it into code_challenge, and sends it to the auth server. Intercepted authorization codes cannot be redeemed without the original verifier."
  }
]);

// hld25: Symmetric vs Asymmetric Encryption
QB.add("hld25", [
  {
    q: "How does the TLS 1.3 handshake combine Asymmetric and Symmetric encryption to provide secure, high-performance HTTPS communications?",
    o: [
      "Asymmetric encryption (Elliptic Curve Diffie-Hellman) is used during the handshake to authenticate identity and negotiate a shared session key; fast Symmetric encryption (AES-GCM or ChaCha20) encrypts all subsequent data transfer",
      "It uses only RSA 4096-bit encryption for every HTTP packet",
      "It uses AES-128 for authentication and RSA for data transfer",
      "It runs plaintext HTTP over UDP"
    ],
    a: 0,
    e: "Asymmetric cryptography solves key distribution but is computationally expensive. Symmetric cryptography is blistering fast (hardware-accelerated AES-NI). Hybrid encryption gives you the best of both worlds."
  }
]);

// hld27: Thundering Herd & Cache Stampede
QB.add("hld27", [
  {
    q: "When a popular cached item (e.g. homepage breaking news) expires in Redis, thousands of concurrent requests can simultaneously miss cache and crash the database. What strategy prevents this Cache Stampede?",
    o: [
      "Mutex locking / Singleflight (only one thread acquires a distributed lock to query the DB and repopulate cache while others wait) or Probabilistic Early Expiration (XFetch)",
      "Deleting the database indexes",
      "Setting cache TTL to 0 seconds",
      "Restarting the Redis cluster"
    ],
    a: 0,
    e: "Mutex locking ensures only 1 worker hits the DB. Probabilistic Early Expiration (XFetch algorithm) proactively re-caches the item in the background based on a random probability before the TTL strictly expires."
  }
]);

// hld28: API Gateway Architecture
QB.add("hld28", [
  {
    q: "What is the 'Backend for Frontend' (BFF) architectural pattern when implemented with API Gateways?",
    o: [
      "Creating dedicated gateway instances tailored specifically to the needs of individual frontend client types (e.g. mobile app BFF, desktop web BFF, public 3rd-party API BFF)",
      "Combining frontend HTML and backend SQL into a single file",
      "Hosting the database on mobile devices",
      "Eliminating all API gateways entirely"
    ],
    a: 0,
    e: "Mobile apps need compact payloads and aggregated calls over cellular networks, while desktop web apps can handle richer data. BFF provides separate lightweight gateways tailored to each client's specific UI requirements."
  }
]);

// hld29: Service Mesh
QB.add("hld29", [
  {
    q: "In an enterprise Kubernetes cluster, what functionality does a Service Mesh (e.g. Istio with Envoy sidecars) provide that an API Gateway typically does not?",
    o: [
      "East-West (service-to-service) traffic management, automatic mutual TLS (mTLS) zero-trust encryption between pods, distributed traffic splitting (canary releases), and transparent observability without changing application code",
      "Hosting the static frontend HTML files",
      "Managing MySQL database migrations",
      "Replacing Kubernetes DNS"
    ],
    a: 0,
    e: "API Gateways handle North-South ingress traffic entering the cluster from the internet. Service Meshes handle East-West internal communication between microservices transparently via sidecar network proxies."
  }
]);

// hld30: DNS Architecture
QB.add("hld30", [
  {
    q: "What is the difference between an 'A' record and a 'CNAME' record in DNS?",
    o: [
      "An 'A' record maps a hostname directly to an IPv4 address; a 'CNAME' (Canonical Name) record aliases one domain name to another domain name",
      "An 'A' record is for email; CNAME is for web",
      "CNAME records resolve faster than A records",
      "An 'A' record can only point to Amazon AWS IP addresses"
    ],
    a: 0,
    e: "A records map host -> IP (e.g. api.example.com -> 192.0.2.1). CNAME maps alias -> target domain (e.g. www.example.com -> example.com). Note: DNS RFC prohibits CNAME records at the root/apex domain (@)."
  }
]);

// hld32: Common Security Attacks
QB.add("hld32", [
  {
    q: "How does the 'SameSite=Strict' or 'SameSite=Lax' cookie attribute defend web applications against Cross-Site Request Forgery (CSRF) attacks?",
    o: [
      "The browser refuses to send the cookie along with cross-site requests initiated by third-party malicious sites, preventing unauthorized actions on behalf of authenticated users",
      "It encrypts the cookie with a 256-bit AES key",
      "It prevents JavaScript from reading document.cookie (that is HttpOnly)",
      "It forces cookies to expire after 5 seconds"
    ],
    a: 0,
    e: "CSRF exploits the browser's behavior of automatically sending cookies to target domains. SameSite=Lax or Strict blocks cookies from cross-site POSTs, neutralizing CSRF for all modern browsers."
  }
]);
'''

# Append to files
with open(os.path.join(BANKS_DIR, 'bank_microservices.js'), 'a', encoding='utf-8') as f:
    f.write(ms_extra)

with open(os.path.join(BANKS_DIR, 'bank_eda.js'), 'a', encoding='utf-8') as f:
    f.write(eda_extra)

with open(os.path.join(BANKS_DIR, 'bank_junit.js'), 'a', encoding='utf-8') as f:
    f.write(junit_extra)

with open(os.path.join(BANKS_DIR, 'bank_hld.js'), 'a', encoding='utf-8') as f:
    f.write(hld_extra)

print('Successfully appended Part 1 banks (Microservices, EDA, JUnit5, HLD)!')
