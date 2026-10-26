'use strict';
/* =========================================================
   DevPath Question Bank: Core Java & JVM Architecture
   ========================================================= */

// ja1: OOPs Concept
QB.add("ja1", [
  {
    q: "Which OOP principle is mainly about hiding an object's internal state and exposing it only through controlled methods?",
    o: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction of interfaces only"],
    a: 0,
    e: "Encapsulation bundles data with the methods that operate on it and restricts direct access to internal fields (information hiding), usually via private fields and public accessors."
  },
  {
    q: "What does this program print?",
    k: "class Animal {\n  String sound() { return \"...\"; }\n}\nclass Dog extends Animal {\n  String sound() { return \"Woof\"; }\n}\npublic class Main {\n  public static void main(String[] args) {\n    Animal a = new Dog();\n    System.out.println(a.sound());\n  }\n}",
    o: ["Woof", "...", "Compile error: incompatible types", "ClassCastException at runtime"],
    a: 0,
    e: "Instance method invocations in Java use virtual method invocation (dynamic dispatch). The actual runtime object (Dog) determines the method executed, regardless of the reference type (Animal)."
  },
  {
    q: "What does this program print?",
    k: "class A { String name = \"A\"; }\nclass B extends A { String name = \"B\"; }\npublic class Main {\n  public static void main(String[] args) {\n    A obj = new B();\n    System.out.println(obj.name);\n  }\n}",
    o: ["A", "B", "AB", "Compile error: duplicate field"],
    a: 0,
    e: "Fields in Java are NOT polymorphic. Field access is resolved at compile time based strictly on the declared reference type (A), so the shadowed variable in class B is ignored."
  },
  {
    q: "Which statement regarding abstract classes vs interfaces in modern Java (Java 17+) is true?",
    o: [
      "An abstract class can maintain mutable instance state and constructors; an interface cannot have instance state",
      "An interface can declare constructors, but abstract classes cannot",
      "A class can extend multiple abstract classes but only implement one interface",
      "Abstract classes cannot declare concrete or default methods"
    ],
    a: 0,
    e: "Abstract classes participate in object instantiation hierarchies and can hold instance state and constructors. Interfaces only allow constants (static final) and abstract/default/static/private methods."
  },
  {
    q: "What is the output of the following constructor hierarchy?",
    k: "class Base {\n  Base() { System.out.print(\"Base \"); }\n}\nclass Child extends Base {\n  Child() { System.out.print(\"Child \"); }\n}\npublic class Main {\n  public static void main(String[] args) {\n    new Child();\n  }\n}",
    o: ["Base Child ", "Child Base ", "Child ", "Compile error: missing super() call"],
    a: 0,
    e: "Every subclass constructor invokes super() as its first statement. If omitted, javac automatically inserts an implicit no-arg super(), executing the parent constructor first."
  },
  {
    q: "Why is 'favor composition over inheritance' widely recognized as an architectural best practice?",
    o: [
      "It avoids fragile base class coupling and allows dynamic swapping of behavior at runtime",
      "Inheritance is deprecated in Java 17+",
      "Composition is always optimized faster by the JIT compiler",
      "Composition is the only way to achieve polymorphism in Java"
    ],
    a: 0,
    e: "Inheritance exposes subclass internals to parent changes (white-box reuse). Composition holds a reference behind an interface (black-box reuse), which prevents tight coupling and simplifies unit testing."
  },
  {
    q: "What does this code print due to overload resolution rules?",
    k: "public class Main {\n  static void f(Object o) { System.out.println(\"Object\"); }\n  static void f(String s) { System.out.println(\"String\"); }\n  public static void main(String[] args) {\n    f(null);\n  }\n}",
    o: ["String", "Object", "Compile error: ambiguous method call", "NullPointerException"],
    a: 0,
    e: "Java chooses the most specific applicable method at compile time. Since String is a subtype of Object, f(String) is more specific than f(Object), so f(String) is selected for null."
  },
  {
    q: "What is the Liskov Substitution Principle (LSP) in SOLID design?",
    o: [
      "Subtypes must be substitutable for their base types without altering the correctness of the program",
      "A class should only have one reason to change",
      "High-level modules should not depend on low-level modules",
      "Interfaces must be split until they contain only one method"
    ],
    a: 0,
    e: "LSP guarantees that a subclass honors the contracts, preconditions, and postconditions of its parent type so callers using the parent abstraction never experience unexpected side effects."
  },
  {
    q: "What happens when calling a static method on a subclass reference assigned to a parent variable?",
    k: "class P {\n  static String who() { return \"P\"; }\n}\nclass C extends P {\n  static String who() { return \"C\"; }\n}\npublic class Main {\n  public static void main(String[] args) {\n    P p = new C();\n    System.out.println(p.who());\n  }\n}",
    o: ["P", "C", "Compile error", "ClassCastException"],
    a: 0,
    e: "Static methods cannot be overridden; they are hidden. Static method dispatch is resolved at compile time using the static type of the reference (P), so P.who() is invoked."
  },
  {
    q: "Which keyword prevents both class inheritance and method overriding?",
    o: ["final", "static", "sealed", "const"],
    a: 0,
    e: "Applying 'final' to a class forbids inheritance; applying 'final' to a method forbids overriding."
  }
]);

// ja2: How Java Program Works (JVM, JIT, Bytecode, ClassLoaders)
QB.add("ja2", [
  {
    q: "Which JVM component compiles hot bytecode into optimized native machine code at runtime?",
    o: ["JIT Compiler (Just-In-Time)", "Java Bytecode Verifier", "Bootstrap ClassLoader", "Garbage Collector"],
    a: 0,
    e: "The JIT (Just-In-Time) compiler identifies frequently executed methods ('hot spots') and compiles the intermediate bytecode into native processor instructions for high performance."
  },
  {
    q: "In what order does standard ClassLoader delegation occur in the JVM?",
    o: [
      "Bootstrap ClassLoader -> Platform/Extension ClassLoader -> Application (System) ClassLoader",
      "Application ClassLoader -> Bootstrap ClassLoader -> Platform ClassLoader",
      "Platform ClassLoader -> Application ClassLoader -> Custom ClassLoader",
      "Operating System -> Application ClassLoader -> Bootstrap ClassLoader"
    ],
    a: 0,
    e: "Under the parental delegation model, class loading requests delegate upward to the root (Bootstrap ClassLoader) first before attempting to load locally downwards."
  },
  {
    q: "What is the primary function of the JVM Bytecode Verifier?",
    o: [
      "Checks that loaded class files adhere to JVM specifications and do not violate type safety or stack constraints",
      "Compiles bytecode directly into assembly code before execution",
      "Allocates heap memory for all static variables",
      "Encrypts class files to prevent reverse engineering"
    ],
    a: 0,
    e: "The Bytecode Verifier runs before execution to confirm that the code doesn't overflow/underflow the operand stack, perform illegal data type conversions, or access private fields illegally."
  },
  {
    q: "Where does the JVM store method bytecode, runtime constant pools, and static variables since Java 8?",
    o: ["Metaspace (native memory)", "Permanent Generation (PermGen)", "Java Thread Stack", "Code Cache only"],
    a: 0,
    e: "Java 8 replaced PermGen with Metaspace, which is allocated out of native OS memory rather than contiguous heap memory, avoiding frequent PermGen OutOfMemoryErrors."
  },
  {
    q: "What does the 'Write Once, Run Anywhere' (WORA) philosophy depend on?",
    o: [
      "Standardized Java Bytecode (.class) executed on platform-specific Java Virtual Machines",
      "Identical hardware architectures across client and server machines",
      "Automatic conversion of Java source directly into C code",
      "WebAssembly compilation"
    ],
    a: 0,
    e: "The compiler (javac) emits universal platform-independent bytecode, while each target platform provides its own JVM implementation to translate bytecode to local machine code."
  }
]);

// ja4: Primitive Data Types
QB.add("ja4", [
  {
    q: "How many bits does a standard Java primitive int occupy across all operating systems and architectures?",
    o: ["32 bits", "16 bits", "64 bits", "Varies depending on whether OS is 32-bit or 64-bit"],
    a: 0,
    e: "Unlike C/C++, Java strictly defines the size of all primitive types in the language specification: an int is always 32-bit signed two's complement."
  },
  {
    q: "What does this program print?",
    k: "public class Main {\n  public static void main(String[] args) {\n    int x = Integer.MAX_VALUE;\n    x++;\n    System.out.println(x);\n  }\n}",
    o: ["-2147483648", "2147483648", "ArithmeticException", "Compile error: integer overflow"],
    a: 0,
    e: "Primitive integer arithmetic in Java overflows silently by wrapping around according to two's complement arithmetic: Integer.MAX_VALUE + 1 becomes Integer.MIN_VALUE (-2147483648)."
  },
  {
    q: "What is the printed result of evaluating 0.1 + 0.2 == 0.3 in Java?",
    k: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(0.1 + 0.2 == 0.3);\n  }\n}",
    o: ["false", "true", "0.30000000000000004", "Compile error"],
    a: 0,
    e: "Binary IEEE 754 floating-point numbers cannot represent fractions like 0.1 and 0.2 exactly. Their sum is approximately 0.30000000000000004, so equality returns false."
  },
  {
    q: "What is the output of this compound assignment?",
    k: "public class Main {\n  public static void main(String[] args) {\n    char c = 'A';\n    c += 2;\n    System.out.println(c);\n  }\n}",
    o: ["C", "67", "A2", "Compile error: possible loss of precision"],
    a: 0,
    e: "Compound assignment operators (+=, -=) automatically inject an implicit cast: c = (char)(c + 2). 'A' (ASCII 65) + 2 becomes 'C' (ASCII 67)."
  },
  {
    q: "What is printed by the integer wrapper comparisons below?",
    k: "public class Main {\n  public static void main(String[] args) {\n    Integer a = 127, b = 127;\n    Integer c = 128, d = 128;\n    System.out.println((a == b) + \" \" + (c == d));\n  }\n}",
    o: ["true false", "true true", "false false", "false true"],
    a: 0,
    e: "Integer.valueOf caches boxed objects in the range -128 to 127. So 'a == b' checks identical cached references (true), while 128 allocates distinct heap instances (false)."
  },
  {
    q: "What does this snippet print?",
    k: "public class Main {\n  public static void main(String[] args) {\n    byte b = (byte) 130;\n    System.out.println(b);\n  }\n}",
    o: ["-126", "130", "126", "-130"],
    a: 0,
    e: "A byte ranges from -128 to 127 (256 distinct values). Casting 130 wraps into negative space: 130 - 256 = -126."
  },
  {
    q: "What does Math.abs(Integer.MIN_VALUE) return?",
    k: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(Math.abs(Integer.MIN_VALUE));\n  }\n}",
    o: ["-2147483648", "2147483648", "2147483647", "Throws ArithmeticException"],
    a: 0,
    e: "The absolute value of -2147483648 is +2147483648, which exceeds Integer.MAX_VALUE (2147483647). Because of 32-bit overflow, it cycles back to Integer.MIN_VALUE."
  }
]);

// ja9: Memory Management and GC
QB.add("ja9", [
  {
    q: "What constitutes a Garbage Collection 'GC Root' in the JVM?",
    o: [
      "Active local stack variables, active Java threads, static variables in loaded classes, and JNI references",
      "Any object with a non-null reference inside the Young Generation",
      "All objects created within the last 10 seconds",
      "Any object implementing Serializable"
    ],
    a: 0,
    e: "GC Roots are objects accessible from outside the heap: local variables/parameters on thread stacks, active threads, static references in Metaspace, and JNI global/local handles."
  },
  {
    q: "How does generational garbage collection partition the Java Heap?",
    o: [
      "Young Generation (Eden, Survivor 0, Survivor 1) and Old (Tenured) Generation",
      "Stack, Native Memory, and Global Heap",
      "Metaspace, PermGen, and CodeCache",
      "Volatile Memory and Persistent Memory"
    ],
    a: 0,
    e: "Based on the Weak Generational Hypothesis (most objects die young), the heap divides into Eden + Survivors (Young Gen) and Tenured (Old Gen)."
  },
  {
    q: "What is the primary architectural advantage of the Z Garbage Collector (ZGC)?",
    o: [
      "Ultra-low latency with pause times under 1 millisecond, independent of heap size",
      "Complete elimination of native memory usage",
      "Compiling Java code directly without bytecode",
      "Automatic repair of memory leaks in user code"
    ],
    a: 0,
    e: "ZGC achieves sub-millisecond maximum STW (Stop-The-World) pause times using colored pointers and concurrent load barriers, scaling seamlessly across gigabytes to terabytes."
  },
  {
    q: "When an object overrides finalize(), how does the JVM handle its reclamation in modern Java?",
    o: [
      "Object finalization is deprecated (Java 9) and terminally deprecated (Java 18); finalizers delay GC by at least one extra cycle and risk resurrection bugs",
      "It is immediately deallocated on the thread that created it",
      "It is freed faster than non-finalized objects",
      "It cannot be garbage collected under any circumstance"
    ],
    a: 0,
    e: "Finalizers create severe memory leaks, delay reclamation, and suffer from thread starvation. Java recommends java.lang.ref.Cleaner or try-with-resources (AutoCloseable)."
  },
  {
    q: "What causes a java.lang.OutOfMemoryError: Java heap space?",
    o: [
      "The application keeps live references to unreachable objects that cannot be cleared by the GC despite expanding the heap to -Xmx",
      "A recursive method call overflows the thread call stack",
      "The operating system runs out of swap space",
      "A thread deadlocks waiting for a synchronized lock"
    ],
    a: 0,
    e: "Heap space OOM occurs when live, strongly reachable objects accumulate (such as unchecked collections, static caches, or unclosed listeners) and consume all allocated heap space."
  }
]);

// ja22: Collections Framework
QB.add("ja22", [
  {
    q: "In Java 8+, what happens to a HashMap bucket when the number of collided entries exceeds TREEIFY_THRESHOLD (8)?",
    o: [
      "The bucket converts from a singly-linked list to a Red-Black balanced tree (TreeNode) if the table capacity is at least 64",
      "The HashMap immediately throws a ConcurrentModificationException",
      "The entries are discarded and a rehash is aborted",
      "It switches to an ArrayBlockingQueue"
    ],
    a: 0,
    e: "To prevent worst-case O(n) denial-of-service degradation from hash collisions, Java 8 converts collided buckets with >= 8 nodes into balanced Red-Black trees (O(log n) lookup)."
  },
  {
    q: "What is the time complexity difference between ArrayList and LinkedList for element retrieval by index (get(i))?",
    o: [
      "ArrayList is O(1); LinkedList is O(n)",
      "ArrayList is O(n); LinkedList is O(1)",
      "Both are O(1) random access",
      "Both are O(log n) binary search"
    ],
    a: 0,
    e: "ArrayList stores elements in contiguous array memory, enabling instantaneous O(1) pointer arithmetic. LinkedList must traverse node pointers sequentially from head or tail (O(n))."
  },
  {
    q: "Why should mutable keys in a HashMap NEVER be mutated after insertion?",
    o: [
      "Changing the object's fields changes its hashCode(), making it impossible for map.get() to locate the original bucket",
      "It causes a runtime ClassCastException",
      "The JVM automatically deletes mutated keys from memory",
      "It causes an instant ConcurrentModificationException"
    ],
    a: 0,
    e: "A HashMap routes lookups by key.hashCode(). If the key mutates, its new hash routes lookups to a different bucket, or fails .equals() checks, making the entry permanently lost."
  },
  {
    q: "How does ConcurrentHashMap achieve thread safety without locking the entire map like Collections.synchronizedMap()?",
    o: [
      "Fine-grained locking on bucket head nodes (synchronized on head node) and CAS (Compare-And-Swap) for empty bucket insertions",
      "It uses a single ReentrantLock around all read and write operations",
      "It copies the entire underlying array on every write operation",
      "It runs only on a single background worker thread"
    ],
    a: 0,
    e: "ConcurrentHashMap uses CAS for inserting the first node of an empty bucket, and locks only the individual bucket's root node for updates, allowing concurrent reads without locks."
  },
  {
    q: "What is the key functional difference between Comparable<T> and Comparator<T>?",
    o: [
      "Comparable defines a single natural ordering inside the class via compareTo(); Comparator defines custom external ordering strategies via compare()",
      "Comparable is for primitives; Comparator is for objects",
      "Comparable is thread-safe; Comparator is not",
      "Comparable was introduced in Java 8; Comparator in Java 1.2"
    ],
    a: 0,
    e: "Comparable<T> provides natural sorting intrinsic to the entity (e.g. String.compareTo()). Comparator<T> is a separate functional interface allowing arbitrary sorting strategies."
  }
]);
