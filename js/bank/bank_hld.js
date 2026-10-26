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
