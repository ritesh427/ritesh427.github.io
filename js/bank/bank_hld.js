'use strict';
/* =========================================================
   DevPath Question Bank: High Level Design & Distributed Systems
   ========================================================= */

// hld1: Network Protocols (HTTP, TCP, UDP, QUIC)
QB.add("hld1", [
  {
    q: "Why does HTTP/2 provide significantly higher throughput than HTTP/1.1 over high-latency networks?",
    o: [
      "Binary framing and request/response Multiplexing over a single shared TCP connection, eliminating head-of-line blocking at the application layer",
      "HTTP/2 eliminates TCP and runs over UDP exclusively",
      "HTTP/2 compresses images using native JPEG compression",
      "HTTP/2 only allows one request per minute"
    ],
    a: 0,
    e: "HTTP/1.1 requires opening multiple TCP connections to fetch resources concurrently. HTTP/2 interleaves binary frames for multiple bidirectional requests and responses over a single TCP stream."
  },
  {
    q: "How does HTTP/3 (QUIC) resolve the TCP Head-of-Line (HoL) blocking problem that still affects HTTP/2?",
    o: [
      "It replaces TCP with QUIC over UDP; packet loss on one stream only delays that specific stream without stalling unrelated parallel streams",
      "It disables packet acknowledgement entirely",
      "It routes every packet through satellite relays",
      "It limits payloads to 64 bytes"
    ],
    a: 0,
    e: "Under HTTP/2, because all streams share one TCP connection, a single lost TCP packet stalls ALL streams until retransmitted. HTTP/3 runs on QUIC (over UDP), providing stream-level isolation."
  }
]);

// hld2: CAP Theorem & PACELC Theorem
QB.add("hld2", [
  {
    q: "Under the CAP Theorem, why is it mathematically impossible for a distributed data store to guarantee both strict Consistency (C) and 100% Availability (A) during a Network Partition (P)?",
    o: [
      "If communication between separated partitions is severed, nodes must choose between rejecting writes to maintain consistency or accepting writes that cause data to diverge",
      "Because network routers only support one database connection at a time",
      "Because CPU clock speeds differ between data centers",
      "It is possible if using fiber-optic cables"
    ],
    a: 0,
    e: "Partitions (network drops/delays) are inevitable in real-world networks. When a partition occurs, an architect must choose: either reject writes/reads (CP system) or allow writes with stale reads (AP system)."
  },
  {
    q: "What does the PACELC theorem add to the traditional CAP theorem?",
    o: [
      "If there is a Partition (P), trade off Availability (A) vs Consistency (C); Else (E), during normal operation, trade off Latency (L) vs Consistency (C)",
      "It proves that relational databases cannot scale past 1 TB",
      "It defines how passwords should be hashed in distributed clusters",
      "It specifies encryption standards for cloud storage"
    ],
    a: 0,
    e: "CAP only addresses behavior during rare network partitions. PACELC highlights that even during normal operation (E), a system must still trade off Latency vs Consistency (e.g. synchronous multi-node replication vs async replication)."
  }
]);

// hld6: Consistent Hashing
QB.add("hld6", [
  {
    q: "Why is Consistent Hashing critical when designing distributed caching tiers (e.g. Memcached, DynamoDB, Cassandra) compared to simple 'hash(key) % N'?",
    o: [
      "When a cache node is added or removed, Consistent Hashing only remaps k/N keys on average, whereas 'hash % N' remaps nearly 100% of keys, causing a catastrophic cache stampede on the database",
      "Consistent Hashing encrypts keys with AES-256",
      "Consistent Hashing eliminates the need for RAM in cache nodes",
      "It forces all keys to reside on node 0"
    ],
    a: 0,
    e: "With hash(key) % N, changing N from 10 to 11 changes the remainder for almost all keys, invalidating the entire cache. Consistent Hashing maps nodes and keys onto a circular hash ring (0 to 2^32-1), localizing redistribution."
  },
  {
    q: "What problem do 'Virtual Nodes' (VNodes) solve in a Consistent Hashing ring?",
    o: [
      "They eliminate hot-spot data skew and ensure uniform distribution of keys across physical machines by mapping each physical node to multiple distinct tokens across the ring",
      "They allow physical machines to run without power",
      "They duplicate all database records across the internet",
      "They convert key strings into integers"
    ],
    a: 0,
    e: "With few physical nodes, random ring placement causes non-uniform arc lengths (one server handles 70% of traffic). Assigning hundreds of virtual tokens per physical server balances the load proportionally."
  }
]);

// hld7: URL Shortener Design
QB.add("hld7", [
  {
    q: "Why is Base62 (a-z, A-Z, 0-9) encoding preferred over Base64 for generating short URL slugs (e.g. bit.ly/abc123X)?",
    o: [
      "Base62 avoids characters like '+' and '/' which have reserved syntactic meanings in URLs and require escape encoding",
      "Base62 produces shorter strings than Base64",
      "Base62 is natively supported by CSS",
      "Base64 cannot represent numbers"
    ],
    a: 0,
    e: "Base64 includes '+' and '/' (or '=' padding), which break URL routing or require percent-encoding (%2B, %2F). Base62 uses 26 lowercase + 26 uppercase + 10 digits = 62 alphanumeric, URL-safe characters."
  },
  {
    q: "How many unique short URLs can a 7-character Base62 string represent?",
    o: [
      "62^7 ≈ 3.52 Trillion URLs",
      "7^62 URLs",
      "7 Million URLs",
      "62 Million URLs"
    ],
    a: 0,
    e: "62 * 62 * 62 * 62 * 62 * 62 * 62 = 62^7 ≈ 3,521,614,606,208 (over 3.5 trillion unique slugs), easily handling billions of URL generation requests for decades."
  }
]);

// hld14: Idempotent POST API
QB.add("hld14", [
  {
    q: "How does Stripe ensure payment creation APIs (POST /v1/charges) are strictly idempotent when a mobile network drops and retries the request?",
    o: [
      "Clients send a unique 'Idempotency-Key' in HTTP headers; the server locks on the key, executes payment, stores the response in Redis/DB, and returns the cached response on duplicate requests",
      "By disallowing credit card retries within 24 hours",
      "By blocking all mobile clients from making payments",
      "By converting all POST endpoints into GET endpoints"
    ],
    a: 0,
    e: "When a request with Idempotency-Key: XYZ arrives, Stripe stores the key. If an identical request arrives while processing, it rejects it; if it arrives after completion, it replays the exact recorded response without charging again."
  }
]);

// hld19: Distributed Caching & Cache Invalidation
QB.add("hld19", [
  {
    q: "What is the 'Cache-Aside' (Lazy Loading) pattern?",
    o: [
      "Application reads from cache first; if cache miss, reads from DB, writes result into cache, and returns; application updates DB directly and invalidates (evicts) the cache entry",
      "The database automatically populates the cache in the background",
      "Cache writes directly to disk without involving the application",
      "Writes are buffered in memory and written to DB every midnight"
    ],
    a: 0,
    e: "In Cache-Aside, the application code coordinates both datastores. On read: Cache -> DB -> populate Cache. On write: Write to DB -> Evict (delete) Cache key (prefer eviction over updating cache to avoid race conditions)."
  },
  {
    q: "What is the 'Thundering Herd' (Cache Stampede) problem, and how do you prevent it?",
    o: [
      "When a popular hot cache key expires, thousands of concurrent requests simultaneously experience a cache miss and overwhelm the underlying database; prevent using distributed mutex locks or probabilistic early recomputation (XFetch)",
      "When the cache server runs out of disk space",
      "When database connections are left open permanently",
      "When multiple users try to log in with the same password"
    ],
    a: 0,
    e: "A hot key expiring causes hundreds of threads to query the DB for the same expensive query simultaneously. A distributed mutex (e.g. Redis lock) ensures only 1 thread queries DB and populates cache while others wait."
  },
  {
    q: "How does a Bloom Filter prevent 'Cache Penetration' (requests for non-existent IDs hitting the database continuously)?",
    o: [
      "A fast, space-efficient probabilistic data structure that can conclusively verify if an ID definitely does NOT exist; requests for non-existent IDs are rejected before querying cache or DB",
      "It caches the entire database in memory",
      "It deletes invalid user accounts",
      "It encrypts the database primary keys"
    ],
    a: 0,
    e: "Malicious attackers query non-existent keys (e.g. user_id = -9999). Since it's not in the DB, it never gets cached, hammering the DB. A Bloom Filter filters requests before they touch disk (zero false negatives)."
  }
]);

// hld21: Database Indexing & B+ Trees
QB.add("hld21", [
  {
    q: "Why do relational database engines (PostgreSQL, MySQL InnoDB) use B+ Trees rather than standard Binary Search Trees or B-Trees for disk indexing?",
    o: [
      "B+ Trees have massive branching factors (fanout) requiring very few disk I/O seeks (3-4 levels for millions of rows), and leaf nodes are linked sequentially for blazing fast range queries",
      "Binary search trees are faster on disk but consume more RAM",
      "B+ Trees eliminate the need for foreign keys",
      "B+ Trees do not require disk storage"
    ],
    a: 0,
    e: "Disk seeks are slow. B+ Trees have large block-sized nodes (4KB-16KB) holding hundreds of keys, keeping tree height tiny (depth 3-4). Internal nodes hold only routing keys; all data resides in linked leaf nodes for range scans."
  },
  {
    q: "What is the 'Leftmost Prefix Rule' in composite database indexes (e.g. INDEX(user_id, status, created_at))?",
    o: [
      "The query optimizer can only use the index if the query constraints filter on the leading leftmost column(s) in order; a query filtering only on 'status' cannot use the composite index efficiently",
      "The index only works on columns written in lowercase",
      "The query must specify ORDER BY on the first column",
      "The index is read from right to left"
    ],
    a: 0,
    e: "Composite indexes are sorted primarily by the first column, then sub-sorted by the second, etc. Querying by 'status' without 'user_id' is like searching a phonebook sorted by (LastName, FirstName) when you only know the first name."
  }
]);

// hld26: JWT Security & Token Revocation
QB.add("hld26", [
  {
    q: "What is the primary architectural trade-off of using stateless JSON Web Tokens (JWT) for authentication in microservices?",
    o: [
      "Tokens can be verified independently by microservices without database roundtrips, but revoking a leaked token immediately before its expiration (TTL) requires maintaining a revocation blacklist",
      "JWT tokens cannot contain custom user claims",
      "JWT tokens can only be read over HTTP/1.0",
      "JWT requires all microservices to share the exact same database"
    ],
    a: 0,
    e: "Stateless verification is the superpower of JWTs: services verify the cryptographic signature locally. The downside is revoking compromised tokens immediately: you must check a distributed revocation blacklist (e.g. in Redis)."
  }
]);

// hld33: The Dual-Write Problem & Transactional Outbox
QB.add("hld33", [
  {
    q: "What is the 'Dual Write Problem' when a microservice updates an SQL database and publishes an event to Apache Kafka?",
    o: [
      "If the service crashes after committing the database but before publishing to Kafka (or vice-versa), the database state and event log become permanently out of sync",
      "Writing to two databases simultaneously doubles the cloud hosting bill",
      "Kafka refuses writes from relational database connections",
      "The browser receives two identical responses"
    ],
    a: 0,
    e: "Network calls fail and servers crash. A microservice cannot span a local DB commit and a remote Kafka produce in a single atomic transaction. One will succeed and the other will fail, corrupting downstream consistency."
  },
  {
    q: "How does the Transactional Outbox Pattern with Change Data Capture (CDC / Debezium) solve the Dual Write Problem?",
    o: [
      "The business entity update and outgoing event are committed atomically in the same local DB transaction (in an 'outbox' table); a CDC tool like Debezium streams outbox records from DB transaction logs (WAL) to Kafka with at-least-once delivery",
      "By replacing the database with a Kafka topic",
      "By forcing Kafka to execute SQL rollbacks",
      "By using distributed locks across the entire cluster"
    ],
    a: 0,
    e: "The application writes to its local DB tables AND writes event payloads into an 'outbox' table inside ONE single ACID database transaction. Debezium reads the database write-ahead log (WAL) and reliably publishes events to Kafka."
  }
]);

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
