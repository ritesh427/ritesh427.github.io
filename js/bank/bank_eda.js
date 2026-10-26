'use strict';
/* =========================================================
   DevPath Question Bank: Event-Driven Architecture & Apache Kafka
   ========================================================= */

// eda1: Event Driven Architecture Fundamentals
QB.add("eda1", [
  {
    q: "How does 'Event-Carried State Transfer' differ from simple 'Event Notification' in EDA?",
    o: [
      "Event-Carried State Transfer embeds all relevant entity snapshot data inside the event payload, allowing consumers to update local read models without calling back to the producer via REST",
      "Event-Carried State Transfer only sends an ID and forces consumers to call a synchronous API",
      "Event Notification is only supported by RabbitMQ, not Kafka",
      "Event-Carried State Transfer violates eventual consistency"
    ],
    a: 0,
    e: "Event Notification sends a minimal signal (e.g. 'OrderPlaced: #101'), requiring consumers to query the Order API. Event-Carried State Transfer includes full details (items, prices, customer), completely decoupling consumers from producer runtime availability."
  },
  {
    q: "In an event-driven microservice system, what is the trade-off of Eventual Consistency compared to ACID distributed transactions?",
    o: [
      "Higher throughput, fault tolerance, and independent service availability, in exchange for temporary data inconsistency between services until events are processed",
      "Instant synchronous database rollback across all microservices",
      "Zero network latency on all message exchanges",
      "Total elimination of dead-letter queues"
    ],
    a: 0,
    e: "ACID transactions across microservices (e.g. Two-Phase Commit) suffer from blocking locks, high latency, and poor availability (CAP theorem). Eventual consistency delivers non-blocking scale by accepting that replicas lag temporarily."
  }
]);

// eda2: Kafka Architecture & Storage Internals
QB.add("eda2", [
  {
    q: "Why is Apache Kafka capable of achieving millions of writes per second on standard spinning hard drives or NVMe SSDs?",
    o: [
      "Sequential append-only log writes, heavy reliance on the OS PageCache, and Zero-Copy network transfer via sendfile() syscall",
      "It parses JSON into B-trees before writing to disk",
      "It keeps all topic data exclusively in RAM without persistence",
      "It runs a dedicated GPU thread on each broker"
    ],
    a: 0,
    e: "Sequential disk I/O matches or exceeds random memory access speeds. Kafka relies on the OS pagecache (avoiding double-caching in JVM heap) and utilizes Linux zero-copy (sendfile) to stream bytes directly from OS cache to network socket."
  },
  {
    q: "In modern Apache Kafka (version 3.3+), how is cluster metadata and controller consensus managed without ZooKeeper?",
    o: [
      "KRaft (Kafka Raft Metadata Mode), an event-driven Raft consensus algorithm built natively into designated Kafka controller brokers",
      "etcd clusters deployed as external sidecars",
      "HashiCorp Consul metadata leader election",
      "A centralized MySQL metadata database"
    ],
    a: 0,
    e: "KRaft replaced ZooKeeper. Kafka controllers now maintain cluster metadata in an internal replicated Kafka topic using the Raft consensus algorithm, dramatically speeding up cluster recovery and partition scalability."
  },
  {
    q: "What is the relationship between Topics and Partitions in Kafka?",
    o: [
      "A Topic is a logical category; Partitions are the physical append-only log units of parallelism and ordered sequential storage distributed across brokers",
      "A Partition contains multiple Topics",
      "Partitions are only used for temporary dead-letter queues",
      "Every partition must reside on the same physical broker node"
    ],
    a: 0,
    e: "Kafka achieves horizontal scale by partitioning topics. Each partition is an ordered, immutable sequence of messages. Messages within a single partition are strictly ordered; total ordering across different partitions is not guaranteed."
  }
]);

// eda7: Cluster Setup & High Availability
QB.add("eda7", [
  {
    q: "To achieve zero data loss guarantees in Kafka, which combination of producer and broker settings is strictly required?",
    o: [
      "Producer: acks=all (or -1); Broker: min.insync.replicas=2 (with replication.factor >= 3)",
      "Producer: acks=0; Broker: unclean.leader.election.enable=true",
      "Producer: acks=1; Broker: min.insync.replicas=1",
      "Producer: retries=0; Broker: replication.factor=1"
    ],
    a: 0,
    e: "With acks=all, the producer waits until all In-Sync Replicas (ISR) acknowledge the write. Setting min.insync.replicas=2 ensures that at least 2 ISR nodes (leader + 1 follower) must commit before returning success."
  },
  {
    q: "What happens if unclean.leader.election.enable is set to 'true' in a Kafka cluster?",
    o: [
      "An out-of-sync follower (not in ISR) can be elected leader if all ISR replicas fail, restoring topic availability at the cost of silent message loss and divergence",
      "The broker formats all disk partitions immediately",
      "Consumers receive duplicate messages forever",
      "Kafka refuses all write requests permanently"
    ],
    a: 0,
    e: "Unclean leader election favors availability over consistency: it allows a stale follower to become leader. Messages written to the old leader that were never replicated to the stale follower are permanently discarded."
  }
]);

// eda8: Producer Internals (Batching & Accumulator)
QB.add("eda8", [
  {
    q: "What role do linger.ms and batch.size play in the Kafka Producer's RecordAccumulator?",
    o: [
      "linger.ms introduces a slight artificial delay (e.g. 10ms) to allow the producer to buffer more messages into batches up to batch.size before dispatching network requests",
      "linger.ms specifies how long a message can live before being deleted from the broker",
      "batch.size limits the total number of partitions in the cluster",
      "They configure HTTP connection keep-alive timeouts"
    ],
    a: 0,
    e: "By default linger.ms=0, which sends records immediately. Setting linger.ms allows records arriving close together to compress and batch into fewer, larger I/O network packets, boosting throughput dramatically."
  },
  {
    q: "How does the default Kafka Partitioner assign messages when no explicit partition is specified?",
    o: [
      "If a key is provided: murmur2(key) % partitionCount. If key is null: Sticky Partitioner (batches messages to one partition until batch is full, then switches)",
      "Random selection for every single message",
      "Always routes to partition 0",
      "Round-robin on every individual message regardless of key"
    ],
    a: 0,
    e: "Keyed messages hash consistently to the same partition (guaranteeing ordered per-key processing). Null-key messages use the Sticky Partitioner to pack records into larger batches for the same partition."
  }
]);

// eda10: Producer Idempotence
QB.add("eda10", [
  {
    q: "How does Kafka's Idempotent Producer (enable.idempotence=true) prevent duplicate messages when retrying after a network timeout?",
    o: [
      "Each producer is assigned a Producer ID (PID), and each record within a partition gets a monotonically increasing Sequence Number; brokers reject sequence numbers already committed",
      "By calculating an MD5 hash of the entire message payload and querying the database",
      "By forcing consumers to run a deduplication filter",
      "By disallowing retries completely"
    ],
    a: 0,
    e: "If an ACK drops over the network, the producer retries. The broker sees (PID: 1042, Sequence: 4) is already committed in the partition log, acknowledges the duplicate without writing it again, preventing duplicates."
  },
  {
    q: "Since Kafka 3.0, what is the default value of enable.idempotence on the KafkaProducer?",
    o: [
      "true (with acks=all and max.in.flight.requests.per.connection <= 5)",
      "false",
      "Only enabled if ZooKeeper is present",
      "Configured via OS environment variables only"
    ],
    a: 0,
    e: "Kafka 3.0 made safe producer defaults standard: idempotence is enabled by default (true), acks defaults to all (-1), and delivery.timeout.ms manages retry backoff without message reordering."
  }
]);

// eda11 & eda12: Consumer Groups, Rebalances & Offsets
QB.add("eda11", [
  {
    q: "In a Kafka Consumer Group with 4 consumers subscribed to a topic with 3 partitions, how are partitions assigned?",
    o: [
      "3 consumers are each assigned 1 partition; 1 consumer remains idle with no partitions assigned",
      "One consumer processes 2 partitions; three consumers share the remaining partition",
      "Kafka throws an IllegalStateException",
      "All 4 consumers receive every message concurrently"
    ],
    a: 0,
    e: "A single partition within a consumer group can be actively consumed by at most ONE consumer instance at any time to guarantee ordered processing. The 4th consumer acts as an instant standby."
  },
  {
    q: "What is the advantage of the CooperativeStickyAssignor over the legacy Eager rebalance protocol in Kafka?",
    o: [
      "It performs incremental rebalances: consumers continue processing untouched partitions without a global 'Stop-The-World' cluster pause",
      "It deletes stale partitions automatically",
      "It eliminates the need for consumer offsets",
      "It operates without heartbeat threads"
    ],
    a: 0,
    e: "Eager rebalances revoke all partitions from all consumers, halting consumption until reassignment completes. Cooperative rebalancing revokes only the specific partitions that need to migrate."
  },
  {
    q: "What happens if a Kafka consumer takes longer than max.poll.interval.ms to process a batch of records returned by poll()?",
    o: [
      "The Group Coordinator assumes the consumer has hung or died, evicts it from the group, and triggers a rebalance of its partitions to another consumer",
      "The consumer thread is killed by the JVM",
      "Kafka pauses the entire cluster",
      "The messages in the batch are permanently deleted"
    ],
    a: 0,
    e: "max.poll.interval.ms is a safeguard against zombie consumers. If your business logic takes too long (e.g. slow external API or DB query), the consumer is evicted even if its background heartbeat thread is alive."
  }
]);

// eda15 & eda16: Kafka Transactions
QB.add("eda15", [
  {
    q: "What does Kafka's Transactional API achieve when building 'Consume-Process-Produce' streaming pipelines?",
    o: [
      "Atomically writes outgoing messages and commits consumer input offsets in a single atomic transaction across multiple topics and partitions",
      "Encrypts Kafka messages using SSL hardware acceleration",
      "Executes distributed ACID transactions across PostgreSQL and Kafka simultaneously",
      "Guarantees delivery within 5 milliseconds"
    ],
    a: 0,
    e: "Using producer.sendOffsetsToTransaction(), a streaming application guarantees that output records and input consumer offsets are committed together. If the processor crashes, neither is committed, guaranteeing exactly-once semantics (EOS)."
  },
  {
    q: "What consumer setting is required to ensure a consumer only reads committed transactional messages and skips aborted ones?",
    o: [
      "isolation.level=read_committed",
      "enable.auto.commit=false",
      "auto.offset.reset=earliest",
      "acks=all"
    ],
    a: 0,
    e: "The default is read_uncommitted. Setting isolation.level=read_committed instructs the consumer's fetcher to buffer transactional messages up to the Last Stable Offset (LSO) and discard aborted messages."
  }
]);
