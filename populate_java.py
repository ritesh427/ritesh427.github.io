# populate_java.py - Generates interview-grade questions for 35 missing Java topics
import os

BANKS_DIR = '/Users/ritesh/Developer/experiments/ritesh427.github.io/js/bank'

java_extra = '''
// ja6: Reference and Non Primitive
QB.add("ja6", [
  {
    q: "In Java, how are object references handled when passed as arguments to methods?",
    o: [
      "Java is strictly pass-by-value; the reference value (memory address pointer) is copied by value, allowing modifying object fields but not reassigning the caller reference",
      "Java is pass-by-reference for non-primitives and pass-by-value for primitives",
      "Java uses call-by-name semantics for objects",
      "Objects are cloned automatically before being passed into methods"
    ],
    a: 0,
    e: "Java is 100% pass-by-value. When an object is passed, the copy of the reference pointer is passed by value. Reassigning 'param = new Object()' inside the method has zero effect on the caller's variable."
  },
  {
    q: "Where are local primitive variables and object instances stored in the JVM memory architecture?",
    o: [
      "Local primitive variables are stored on the Thread Stack frame; object instances (and their instance variables) are allocated on the Shared Heap",
      "Both are stored exclusively on the Thread Stack",
      "Both are stored in the JVM Metaspace",
      "All Java variables are stored directly in CPU L1 cache"
    ],
    a: 0,
    e: "Thread Stacks store local variables and execution frames for each thread. All objects (and their fields, including primitive fields) reside on the JVM Heap, managed by the Garbage Collector."
  }
]);

// ja7: Methods
QB.add("ja7", [
  {
    q: "How does Method Overloading differ fundamentally from Method Overriding in Java?",
    o: [
      "Overloading is resolved at compile-time (static polymorphism) based on method signature; Overriding is resolved at runtime (dynamic method dispatch) via the vtable based on the actual object type",
      "Overloading requires inheritance; Overriding occurs within the same class",
      "Overloading allows changing only the return type without changing parameter lists",
      "Overriding methods cannot throw exceptions"
    ],
    a: 0,
    e: "Method Overloading (same name, different parameter types/counts) is bound at compile time by javac. Overriding occurs when a subclass redefines an inherited non-static method, dispatched dynamically at runtime."
  }
]);

// ja10: Classes & Generics
QB.add("ja10", [
  {
    q: "What is Type Erasure in Java Generics, and what is its consequence at runtime?",
    o: [
      "The compiler checks type safety and removes generic type arguments (replacing them with Object or bounds), meaning List<String> and List<Integer> share the exact same raw class at runtime",
      "Generic types are converted to C++ void pointers in the JVM",
      "Type erasure converts all generic objects into byte arrays",
      "Type erasure is a memory leak bug in older JVMs"
    ],
    a: 0,
    e: "To preserve backwards compatibility with pre-Java 5 bytecode, javac erases generic types and inserts synthetic casts. At runtime, 'list instanceof List<String>' fails to compile because type arguments do not exist in bytecode."
  },
  {
    q: "According to the PECS rule (Producer Extends, Consumer Super), which wildcard should be used when a method reads items out of a collection?",
    o: [
      "<? extends T> (Upper bounded wildcard for reading/producers)",
      "<? super T> (Lower bounded wildcard for reading)",
      "<?> (Unbounded wildcard only)",
      "Generics cannot be read from in Java"
    ],
    a: 0,
    e: "PECS stands for Producer Extends, Consumer Super. If your method reads items from a collection (it produces items for your method to use), declare it with Collection<? extends T>."
  }
]);

// ja12: Enum, POJO, Singleton
QB.add("ja12", [
  {
    q: "Why did Joshua Bloch famously recommend using an 'Enum' to implement the Singleton pattern in Java?",
    o: [
      "The JVM natively guarantees single-instance instantiation, thread safety, and immunity to reflection and serialization attacks",
      "Enums execute faster than regular classes because they bypass the JVM",
      "Enums do not consume heap memory",
      "Enums can extend multiple classes simultaneously"
    ],
    a: 0,
    e: "A single-element enum provides serializability for free without readResolve(), and the JVM explicitly prevents constructor instantiation via reflection (Constructor.newInstance throws IllegalArgumentException)."
  }
]);

// ja14: Interfaces
QB.add("ja14", [
  {
    q: "How does Java 8 resolve the 'Diamond Problem' when a class implements two interfaces that declare the same default method signature?",
    o: [
      "The compiler forces the implementing class to explicitly override the conflicting method and specify which interface to call (e.g. InterfaceA.super.method())",
      "The JVM picks the interface loaded first alphabetically",
      "The JVM crashes with an UnsatisfiedLinkError at startup",
      "The compiler ignores both methods and leaves the implementation empty"
    ],
    a: 0,
    e: "When two interfaces provide default methods with the exact same signature, the compiler issues an ambiguity error. The developer must override the method and explicitly call InterfaceA.super.method() or supply custom logic."
  }
]);

// ja16: Functional Interface & Lambda
QB.add("ja16", [
  {
    q: "Why must local variables referenced inside a Java lambda expression be 'final' or 'effectively final'?",
    o: [
      "Lambdas capture the value of the variable, not the stack variable itself; allowing mutation would cause concurrency race conditions and stack synchronization anomalies",
      "Java bytecode does not support mutable variables",
      "To allow the JIT compiler to inline the lambda into CPU registers",
      "Variables in lambdas are automatically converted to static constants"
    ],
    a: 0,
    e: "The lambda closure captures a copy of the primitive value or reference pointer. If the enclosing scope could mutate the variable after capture, the lambda's copy would become out of sync, leading to subtle race conditions."
  },
  {
    q: "Which standard java.util.function interface takes an argument of type T and returns a boolean?",
    o: [
      "Predicate<T>",
      "Function<T, R>",
      "Consumer<T>",
      "Supplier<T>"
    ],
    a: 0,
    e: "Predicate<T> defines 'boolean test(T t)'. Consumer<T> accepts T and returns void. Supplier<T> takes no arguments and returns T. Function<T, R> transforms T into R."
  }
]);

// ja17: Java Reflection
QB.add("ja17", [
  {
    q: "What is the primary risk of using 'Field.setAccessible(true)' in production Java code?",
    o: [
      "It circumvents encapsulation by breaking private access boundaries and is restricted by Java Module System (JPMS) strong encapsulation starting in Java 9+",
      "It permanently disables garbage collection for the host class",
      "It forces the CPU to switch to single-core execution",
      "It crashes the JVM with a StackOverflowError"
    ],
    a: 0,
    e: "setAccessible(true) bypasses private modifier checks, creating security vulnerabilities and tight coupling to internal implementation details. Java 9+ JPMS throws InaccessibleObjectException across unexported module boundaries."
  }
]);

// ja18: Annotations
QB.add("ja18", [
  {
    q: "Which '@Retention' policy must be configured on a custom Java annotation for it to be inspected at runtime via Reflection?",
    o: [
      "RetentionPolicy.RUNTIME",
      "RetentionPolicy.CLASS",
      "RetentionPolicy.SOURCE",
      "RetentionPolicy.SYSTEM"
    ],
    a: 0,
    e: "RetentionPolicy.SOURCE annotations are discarded by javac (e.g. @Override). RetentionPolicy.CLASS annotations are recorded in .class bytecode but discarded by the JVM. RetentionPolicy.RUNTIME annotations are retained in the JVM."
  }
]);

// ja19: Exception Handling
QB.add("ja19", [
  {
    q: "What happens to secondary exceptions thrown by 'AutoCloseable.close()' during a try-with-resources statement if the main try block also threw an exception?",
    o: [
      "The secondary exception is added as a 'suppressed exception' to the primary exception (accessible via ex.getSuppressed())",
      "The primary exception is discarded and lost",
      "The JVM terminates immediately with an ExitCode -1",
      "Suppressed exceptions are printed to System.err and ignored"
    ],
    a: 0,
    e: "Try-with-resources preserves the original root exception thrown in the try block and attaches any exceptions thrown during resource closing as suppressed exceptions accessible via Throwable.getSuppressed()."
  }
]);

// ja20: Operators
QB.add("ja20", [
  {
    q: "What is the difference between the conditional logical operator '&&' and the bitwise logical operator '&' in boolean expressions?",
    o: [
      "'&&' short-circuits (skips evaluating the right operand if the left operand is false); '&' evaluates both operands unconditionally",
      "'&' short-circuits while '&&' evaluates both",
      "'&&' can only be used with numbers",
      "There is no difference in boolean contexts"
    ],
    a: 0,
    e: "Short-circuit evaluation: 'if (obj != null && obj.isValid())' safely skips the right operand if obj is null. Using '&' evaluates both operands, throwing a NullPointerException."
  }
]);

// ja21: Control Flow Statements
QB.add("ja21", [
  {
    q: "How does the 'continue' statement with a label behave inside nested loops in Java?",
    o: [
      "It skips the remainder of the current iteration and resumes execution at the next iteration of the labeled outer loop",
      "It terminates the entire Java application immediately",
      "It restarts the outer loop from index 0",
      "Labeled continues are not supported in Java"
    ],
    a: 0,
    e: "A labeled continue ('continue outerLoop;') jumps control directly to the condition or step statement of the designated labeled outer loop, skipping any remaining statements in both inner and outer loops for that iteration."
  }
]);

// ja25: Collections (Part 4 to 6)
QB.add("ja25", [
  {
    q: "How does ConcurrentHashMap achieve high concurrent throughput in Java 8+ without synchronizing the entire table?",
    o: [
      "It uses CAS (Compare-And-Swap) for empty bucket insertion and synchronizes only on the head node of a hash bucket (synchronized(node)), converting buckets to Red-Black trees when bin count >= 8",
      "It uses a single global ReentrantLock on all reads and writes",
      "It locks table segments using 16 separate segmented locks (legacy Java 7)",
      "It relies on OS kernel file locks"
    ],
    a: 0,
    e: "Java 8 ConcurrentHashMap abandoned Segment locking. It inserts empty bins lock-free via CAS (Unsafe/VarHandle) and locks only the individual head node of the bucket during collisions, treeifying bins with >= 8 nodes."
  },
  {
    q: "Why is ArrayDeque preferred over LinkedList when implementing a Stack or Queue in Java?",
    o: [
      "ArrayDeque is backed by a contiguous circular array, offering cache locality and zero node-object allocation overhead compared to LinkedList's pointer nodes",
      "LinkedList is synchronized while ArrayDeque is not",
      "ArrayDeque allows null elements",
      "ArrayDeque has O(N) access time while LinkedList is O(1)"
    ],
    a: 0,
    e: "ArrayDeque has superior CPU cache locality and does not allocate a Node object for every single inserted element. LinkedList incurs heavy GC pressure and memory fragmentation from 24-byte Node allocations."
  }
]);

// ja28: Collections Streams
QB.add("ja28", [
  {
    q: "Why should developers exercise extreme caution when using 'parallelStream()' in a web application request thread?",
    o: [
      "By default, all parallel streams share the common ForkJoinPool.commonPool(); blocking tasks (I/O, database calls) can starve all application CPU-bound tasks",
      "Parallel streams can only process numbers",
      "Parallel streams disable JVM garbage collection",
      "Parallel streams always produce random corrupt results"
    ],
    a: 0,
    e: "ForkJoinPool.commonPool() is shared across the entire JVM. If web request threads run blocking network/DB queries inside parallelStream(), the common pool's worker threads become exhausted, locking up unrelated tasks."
  },
  {
    q: "Which stream operation is an intermediate operation that will NOT execute until a terminal operation is invoked?",
    o: [
      "map() / filter()",
      "collect()",
      "count()",
      "forEach()"
    ],
    a: 0,
    e: "Streams are evaluated lazily. Intermediate operations (filter, map, flatMap, distinct) configure pipeline stages but perform no work until a terminal operation (collect, count, findFirst, forEach) triggers traversal."
  }
]);

// ja29: Multithreading Process vs Threads
QB.add("ja29", [
  {
    q: "What is the primary difference in memory sharing between operating system Processes and JVM Threads?",
    o: [
      "Processes have independent isolated address spaces; Threads of the same process share the heap and metaspace while maintaining their own private stack and program counter (PC)",
      "Threads have isolated virtual memory; Processes share heap memory",
      "Processes cannot communicate across a network",
      "Threads consume 1GB of RAM each by default"
    ],
    a: 0,
    e: "Processes run in isolated address spaces with OS protection boundaries. JVM threads share the common Heap and Metaspace, allowing fast inter-thread communication but requiring synchronization to prevent race conditions."
  }
]);

// ja30: Thread Creation
QB.add("ja30", [
  {
    q: "What is the key advantage of implementing 'Runnable' or 'Callable<T>' over extending the 'Thread' class directly?",
    o: [
      "Java does not support multiple class inheritance; implementing an interface leaves the class free to extend other classes and decouples the task from thread execution mechanics",
      "Extending Thread is deprecated in Java 21",
      "Runnable tasks run 5x faster than Thread subclasses",
      "Thread subclasses cannot be synchronized"
    ],
    a: 0,
    e: "Implementing Runnable or Callable adheres to Single Responsibility (decoupling task logic from thread execution) and avoids wasting the single inheritance slot in Java."
  }
]);

// ja31: Thread Joining & Interruption
QB.add("ja31", [
  {
    q: "What happens when a thread calls 'Thread.interrupt()' on another thread that is blocked in 'Thread.sleep()' or 'Object.wait()'?",
    o: [
      "The blocked thread awakens immediately, throws an InterruptedException, and its thread interruption status flag is cleared to false",
      "The blocked thread is killed by the OS immediately",
      "The thread continues sleeping until the timer expires",
      "The JVM triggers a thread dump"
    ],
    a: 0,
    e: "Blocking methods like sleep(), wait(), and join() detect interruption, clear the thread's interrupted flag, and throw InterruptedException, allowing the thread to catch the exception and perform clean teardown."
  }
]);

// ja32: Locks (ReentrantLock & ReadWriteLock)
QB.add("ja32", [
  {
    q: "What capability does 'ReentrantLock' provide that the intrinsic 'synchronized' keyword does NOT support?",
    o: [
      "Timed lock acquisition (tryLock(timeout)), interruptible locking (lockInterruptibly), and fair lock queuing policies",
      "Locking across different physical servers",
      "Automatic detection of deadlock cycles",
      "Locking without consuming memory"
    ],
    a: 0,
    e: "ReentrantLock provides tryLock() with timeouts, fair ordering policies, multiple Condition variables (for precise wait/notify signaling), and lockInterruptibly(), preventing threads from blocking indefinitely."
  },
  {
    q: "When is a 'ReentrantReadWriteLock' most advantageous over a standard mutual exclusion lock?",
    o: [
      "In read-heavy scenarios with infrequent writes, allowing multiple concurrent reader threads to execute simultaneously while reserving exclusive access for writers",
      "In write-heavy applications with 99% writes",
      "When running on single-core microcontrollers",
      "When locking database files on a network share"
    ],
    a: 0,
    e: "ReentrantReadWriteLock allows any number of concurrent readers as long as no writer holds the writeLock. This dramatically increases throughput when reads vastly outnumber writes."
  }
]);

// ja33: Lock Free & Atomic Operations
QB.add("ja33", [
  {
    q: "How does 'LongAdder' outperform 'AtomicLong' in high-concurrency environments under extreme thread contention?",
    o: [
      "LongAdder maintains an internal array of cell counters that threads update independently via CAS, striping contention and summing cells only when sum() is called",
      "LongAdder uses synchronized blocks with OS spinlocks",
      "LongAdder runs exclusively on GPU shader units",
      "AtomicLong has been deprecated due to memory corruption"
    ],
    a: 0,
    e: "AtomicLong causes high cache-line bouncing because all threads hammer a single memory location with CAS loops. LongAdder stripes the counter across a Cells array, reducing contention to zero until sum() is queried."
  },
  {
    q: "What concurrency issue does 'AtomicStampedReference' resolve that standard 'AtomicReference' cannot detect?",
    o: [
      "The ABA Problem (where a value changes from A to B and back to A without the CAS detecting the intermediate modification)",
      "Deadlock between two worker threads",
      "Garbage collection memory leaks",
      "Out of stack memory errors"
    ],
    a: 0,
    e: "The ABA problem occurs when a memory location is read as A, updated to B, and restored to A. AtomicStampedReference pairs the reference with an integer version/stamp that increments on every change."
  }
]);

// ja34: ThreadPools & ThreadPoolExecutor
QB.add("ja34", [
  {
    q: "When a new task is submitted to a ThreadPoolExecutor, in what order does the executor allocate resources?",
    o: [
      "1. If running threads < corePoolSize, spawn new thread; 2. Else try to offer to workQueue; 3. If workQueue is full and running < maxPoolSize, spawn thread; 4. Else invoke RejectedExecutionHandler",
      "1. Fill workQueue; 2. Spawn corePool threads; 3. Spawn maxPool threads; 4. Throw exception",
      "1. Spawn maxPool threads immediately; 2. Queue remaining tasks",
      "1. Reject task if thread is busy; 2. Queue in database"
    ],
    a: 0,
    e: "ThreadPoolExecutor first spawns up to corePoolSize threads. Once corePoolSize is reached, tasks are buffered into the workQueue. Only when the queue is 100% full will it spawn additional threads up to maximumPoolSize."
  },
  {
    q: "What does the 'CallerRunsPolicy' rejection handler do when the ThreadPoolExecutor's queue is completely saturated?",
    o: [
      "It executes the task directly on the calling thread that submitted it, naturally throttling task submission rate (backpressure)",
      "It discards the task silently without notification",
      "It terminates the JVM with System.exit(1)",
      "It reboots the server operating system"
    ],
    a: 0,
    e: "CallerRunsPolicy runs the rejected task directly in the caller's thread. Because the caller is busy executing the task, it cannot submit further work, creating an elegant backpressure throttling mechanism."
  }
]);

// ja35: CompletableFuture
QB.add("ja35", [
  {
    q: "What is the difference between 'thenApply()' and 'thenCompose()' in CompletableFuture?",
    o: [
      "thenApply maps a value T -> U (synchronous mapping); thenCompose maps T -> CompletableFuture<U> and flattens the nested future (like flatMap)",
      "thenCompose is synchronous; thenApply is asynchronous",
      "thenApply is deprecated in Java 17",
      "There is no difference; they are aliases"
    ],
    a: 0,
    e: "thenApply(fn) takes a function returning a plain value (yielding CompletableFuture<U>). thenCompose(fn) takes a function returning another CompletableFuture<U> and unwraps/flattens it (monadic bind / flatMap)."
  },
  {
    q: "Which static method waits for all provided CompletableFutures to finish before proceeding?",
    o: [
      "CompletableFuture.allOf(c1, c2, c3)",
      "CompletableFuture.anyOf(c1, c2)",
      "CompletableFuture.joinAll()",
      "CompletableFuture.waitAll()"
    ],
    a: 0,
    e: "CompletableFuture.allOf(f1, f2, ...) returns a CompletableFuture<Void> that completes only when every underlying future completes (either normally or exceptionally)."
  }
]);

// ja36: Fork-Join Pool
QB.add("ja36", [
  {
    q: "What is the core algorithmic mechanism that makes ForkJoinPool highly efficient for recursive divide-and-conquer tasks?",
    o: [
      "Work-stealing algorithm: idle worker threads steal tasks from the tail (deques) of busy worker threads",
      "Round-robin time slicing on the Linux kernel",
      "Preemptive priority scheduling",
      "Lock-free circular ring buffers exclusively"
    ],
    a: 0,
    e: "In ForkJoinPool, each worker thread has its own double-ended queue (deque). A thread pushes subtasks to the head of its deque and pops from the head. Idle threads steal tasks from the tail of other deques (work-stealing)."
  }
]);

// ja37: Scheduled ThreadPool
QB.add("ja37", [
  {
    q: "What is the critical behavioral difference between 'scheduleAtFixedRate' and 'scheduleWithFixedDelay' in ScheduledExecutorService?",
    o: [
      "scheduleAtFixedRate schedules periodic executions based on initial start times (ignoring task execution duration); scheduleWithFixedDelay measures the delay starting from the completion time of the previous execution",
      "scheduleWithFixedDelay runs in parallel; scheduleAtFixedRate runs sequentially",
      "scheduleAtFixedRate only runs once",
      "scheduleWithFixedDelay requires an external cron parser"
    ],
    a: 0,
    e: "scheduleAtFixedRate fires every N seconds regardless of execution length (if execution takes longer than period, consecutive runs follow immediately). scheduleWithFixedDelay guarantees N seconds of idle gap between runs."
  }
]);

// ja38: Virtual Threads vs Platform Threads
QB.add("ja38", [
  {
    q: "In Java 21 (Project Loom), how do Virtual Threads achieve massive scalability (millions of concurrent threads) compared to Platform Threads?",
    o: [
      "Virtual Threads are lightweight user-mode threads managed by the JVM rather than 1:1 OS kernel threads; their stack frames are stored on the JVM heap and unmounted when performing blocking I/O",
      "Virtual Threads do not require RAM or CPU cycles",
      "Virtual Threads run in native assembly code outside the JVM",
      "Virtual Threads eliminate the need for Garbage Collection"
    ],
    a: 0,
    e: "Platform threads wrap 1:1 OS threads with ~1MB reserved stack. Virtual threads are managed by the JVM runtime and mounted onto a small pool of Carrier Threads. During blocking I/O, the virtual thread unmounts from its carrier thread."
  },
  {
    q: "What causes 'thread pinning' in Java 21 Virtual Threads, preventing the virtual thread from unmounting during blocking calls?",
    o: [
      "Executing inside a 'synchronized' block/method or calling native methods (JNI)",
      "Using ReentrantLock",
      "Calling Thread.sleep()",
      "Reading from a network socket"
    ],
    a: 0,
    e: "Currently, virtual threads are pinned to their carrier thread if blocking I/O occurs inside a synchronized block or native JNI call. Replace 'synchronized' with ReentrantLock to avoid carrier thread pinning."
  }
]);

// ja39: Project Lombok
QB.add("ja39", [
  {
    q: "Why can using Lombok's '@Data' or '@ToString' on JPA entities with bidirectional relationships cause a fatal StackOverflowError?",
    o: [
      "Lombok's generated equals(), hashCode(), and toString() traverse bidirectional references in an infinite recursive loop",
      "Lombok disables Hibernate dirty checking",
      "Lombok deletes getters and setters at runtime",
      "Lombok modifies entity bytecode after class loading"
    ],
    a: 0,
    e: "If Parent references Child and Child references Parent, Lombok's generated toString() or hashCode() will recursively call each other indefinitely until the JVM runs out of stack memory. Always use @ToString.Exclude."
  }
]);

// ja40: Sequenced Collection (Java 21)
QB.add("ja40", [
  {
    q: "What unified interface hierarchy was introduced in Java 21 to provide consistent access to first and last elements in collections with defined encounter orders?",
    o: [
      "SequencedCollection (with getFirst(), getLast(), addFirst(), addLast(), and reversed())",
      "OrderedList",
      "SortedCollection",
      "IndexedIterable"
    ],
    a: 0,
    e: "Prior to Java 21, getting the first/last element across List, Deque, LinkedHashSet, and SortedSet had different APIs (list.get(0), deque.peekFirst(), set.iterator().next()). SequencedCollection unifies this with getFirst() and reversed()."
  }
]);

// ja41: Sealed Classes and Interfaces (Java 17)
QB.add("ja41", [
  {
    q: "What keywords are used in Java 17 to define a Sealed Class and govern which subclasses can extend it?",
    o: [
      "'sealed' class with 'permits' specifying allowed subclasses, which must be declared 'final', 'sealed', or 'non-sealed'",
      "'restricted' class with 'allows'",
      "'locked' class with 'subclasses'",
      "'private' class with 'package-private'"
    ],
    a: 0,
    e: "A sealed class restricts inheritance: 'public sealed class Shape permits Circle, Square {}'. Every permitted subclass must reside in the same module/package and explicitly declare itself as final, sealed, or non-sealed."
  }
]);

// ja42: Switch Expression (Java 14)
QB.add("ja42", [
  {
    q: "What keyword is used in Java 14+ switch expressions to return a value from a multi-line case block?",
    o: [
      "yield",
      "return",
      "break",
      "pass"
    ],
    a: 0,
    e: "Inside a switch expression block (using 'case X -> { ... }'), the 'yield' keyword is used to produce a value for the expression, avoiding confusion with 'return' which exits the enclosing method."
  }
]);

// ja43: Pattern Matching for instanceof (Java 16)
QB.add("ja43", [
  {
    q: "How does Java 16's Pattern Matching for 'instanceof' improve code safety and conciseness?",
    o: [
      "It eliminates the redundant explicit cast: 'if (obj instanceof String s)' automatically casts and binds the variable 's' within the scope where the predicate is true",
      "It allows instanceof to work on primitive types like int and double",
      "It performs regex matching on class names",
      "It makes the object immutable"
    ],
    a: 0,
    e: "Instead of writing 'if (obj instanceof String) { String s = (String) obj; }', pattern matching allows 'if (obj instanceof String s) { s.length(); }', eliminating boilerplate and casting errors."
  }
]);

// ja44: Pattern Matching for switch (Java 21)
QB.add("ja44", [
  {
    q: "In Java 21, what keyword allows specifying conditional guard expressions in pattern matching switch statements?",
    o: [
      "when (e.g. 'case String s when s.length() > 5 -> ...')",
      "if",
      "where",
      "given"
    ],
    a: 0,
    e: "Java 21 uses the 'when' keyword for guarded pattern cases: 'case String s when s.startsWith(\\'ADMIN\\') -> handleAdmin(s);', providing expressive and type-safe pattern matching."
  }
]);

// ja45: Record Class (Java 16)
QB.add("ja45", [
  {
    q: "Which characteristic is strictly true of a Java 16 'record'?",
    o: [
      "Records are implicitly final, cannot extend any other class (since they implicitly extend java.lang.Record), and all components are private and final",
      "Records cannot implement interfaces",
      "Record fields can be modified using setters",
      "Records can extend abstract classes"
    ],
    a: 0,
    e: "Records are immutable data carriers. They are implicitly final, cannot extend other classes, automatically generate getters (name()), equals(), hashCode(), and toString(), but CAN implement interfaces."
  }
]);

// ja46: Text Blocks (Java 15)
QB.add("ja46", [
  {
    q: "How does the Java compiler determine incidental leading white space when stripping indentation from a Text Block (triple quotes)?",
    o: [
      "By calculating the common minimum indentation across all non-empty lines in the text block and stripping only that prefix",
      "By deleting all spaces in the entire string",
      "By converting all spaces to tabs",
      "By requiring no leading indentation at all"
    ],
    a: 0,
    e: "The compiler inspects every line, identifies the common leading whitespace offset (incidental white space), and strips it automatically, preserving essential relative indentation within SQL or JSON snippets."
  }
]);

// ja47: Optionals (Java 8 to 11)
QB.add("ja47", [
  {
    q: "What is the performance difference between 'optional.orElse(expensiveMethod())' and 'optional.orElseGet(() -> expensiveMethod())'?",
    o: [
      "orElse evaluates the argument eagerly regardless of whether the Optional has a value; orElseGet evaluates lazily only if the Optional is empty",
      "orElse is lazy; orElseGet is eager",
      "orElseGet cannot return null",
      "There is no difference in execution semantics"
    ],
    a: 0,
    e: "orElse() evaluates its parameter eagerly at call time. Even if the Optional already contains a present value, expensiveMethod() is executed! orElseGet() takes a Supplier and is only evaluated when the Optional is empty."
  },
  {
    q: "Which practice is considered an anti-pattern when using Java 'Optional'?",
    o: [
      "Using Optional as method parameters, class fields, or returning 'null' from a method that returns Optional",
      "Using Optional as a return type for queries that may not find a result",
      "Using Optional.map() to transform values",
      "Using Optional.filter() to validate contents"
    ],
    a: 0,
    e: "Optional was designed strictly as a return type to represent absent values. Using it as fields wastes memory (it is not Serializable), and returning 'null' defeats the entire purpose of Optional."
  }
]);

// ja48: Traditional File Handling
QB.add("ja48", [
  {
    q: "Why is 'BufferedReader' wrapped around 'FileReader' when reading large text files in traditional java.io?",
    o: [
      "FileReader reads byte-by-byte from the disk; BufferedReader reads a large chunk into an internal 8KB memory buffer, drastically minimizing expensive disk I/O system calls",
      "BufferedReader encrypts the file during reading",
      "FileReader cannot read UTF-8 files",
      "BufferedReader is mandatory to prevent compiler errors"
    ],
    a: 0,
    e: "Direct disk reads incur high OS context-switch overhead per character. BufferedReader buffers data in an 8KB memory buffer, amortizing system call costs and offering convenient readLine() support."
  }
]);

// ja49: Java NIO (Part 1)
QB.add("ja49", [
  {
    q: "What are the three foundational core abstractions of Java NIO (java.nio)?",
    o: [
      "Channels, Buffers, and Selectors",
      "Streams, Readers, and Writers",
      "Sockets, Threads, and Fibers",
      "Files, Paths, and Permissions"
    ],
    a: 0,
    e: "Java NIO revolves around Channels (bidirectional conduits for data), Buffers (memory blocks holding data), and Selectors (multiplexing non-blocking channels onto a single thread)."
  }
]);

// ja50: Java NIO (Part 2 and 3)
QB.add("ja50", [
  {
    q: "How does 'FileChannel.transferTo()' achieve ultra-fast file transfer in high-performance network servers?",
    o: [
      "It leverages Zero-Copy OS system calls (e.g. Linux sendfile), copying data directly from kernel cache to socket buffer without transferring bytes into user space RAM",
      "It compresses files with zip before sending",
      "It bypasses the network interface card",
      "It splits files across multiple satellite uplinks"
    ],
    a: 0,
    e: "Zero-copy avoids copying data between OS kernel space and Java user space. FileChannel.transferTo invokes OS sendfile(), transferring file data directly from the page cache to the network socket buffer."
  }
]);
'''

with open(os.path.join(BANKS_DIR, 'bank_java.js'), 'a', encoding='utf-8') as f:
    f.write(java_extra)

print('Successfully appended 35 missing Java topics to bank_java.js!')
