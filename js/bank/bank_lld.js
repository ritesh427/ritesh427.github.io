'use strict';
/* =========================================================
   DevPath Question Bank: Low Level Design & Design Patterns
   ========================================================= */

// lld1: SOLID Principles
QB.add("lld1", [
  {
    q: "How does the Open-Closed Principle (OCP) guide object-oriented architecture when adding new payment processors (e.g. PayPal, Stripe, Crypto)?",
    o: [
      "Software entities should be open for extension (by implementing a common PaymentStrategy interface) but closed for modification (existing checkout classes require zero changes)",
      "All classes should have private constructors and open public setters",
      "Classes must never be modified once committed to Git",
      "Every class must be declared abstract"
    ],
    a: 0,
    e: "OCP states classes should be extensible without editing existing, tested code. Adding a new payment processor simply involves implementing the interface rather than bloating existing checkout methods with switch statements."
  },
  {
    q: "What does the Dependency Inversion Principle (DIP) require?",
    o: [
      "High-level business modules should not depend on low-level detail modules; both must depend on abstractions (interfaces)",
      "Child classes must invert the order of parameters in constructors",
      "All dependencies must be instantiated using the 'new' keyword",
      "Controllers must inherit from database repositories"
    ],
    a: 0,
    e: "DIP decouples business rules from infrastructure details (database, network, file system). High-level domain logic communicates with abstract ports/interfaces; implementations (adapters) are injected."
  },
  {
    q: "Which code violation directly breaches the Interface Segregation Principle (ISP)?",
    o: [
      "A massive 'Worker' interface defining work(), eat(), sleep(), and manageEmployees() forcing a Robot implementation to stub out eat() and sleep() with UnsupportedOperationException",
      "A class having more than 5 private methods",
      "An interface extending two other interfaces",
      "A service class having multiple constructors"
    ],
    a: 0,
    e: "ISP says clients should never be forced to depend on methods they do not use. Interfaces should be small and role-specific (e.g. Workable, Feedable) rather than monolithic."
  }
]);

// lld2: Strategy Pattern
QB.add("lld2", [
  {
    q: "When is the Strategy Pattern preferable over conditional switch-case logic?",
    o: [
      "When a family of related algorithms exists and needs to be selected, swapped, or configured dynamically at runtime without modifying client code",
      "When an object needs to maintain exactly one global instance",
      "When converting an incompatible interface into another interface",
      "When building complex objects with 15 optional parameters"
    ],
    a: 0,
    e: "Strategy defines a family of algorithms, encapsulates each one in a separate class, and makes them interchangeable. The client holds a reference to the Strategy interface and delegates execution."
  },
  {
    q: "What design pattern is exemplified by Java's Collections.sort(List, Comparator)?",
    o: [
      "Strategy Pattern",
      "Decorator Pattern",
      "Observer Pattern",
      "Singleton Pattern"
    ],
    a: 0,
    e: "The sorting algorithm delegates comparison logic to the passed Comparator. You can swap in any custom comparison strategy without changing the internal TimSort algorithm."
  }
]);

// lld3: Observer Pattern
QB.add("lld3", [
  {
    q: "What are the core components of the classic Gang of Four Observer Pattern?",
    o: [
      "Subject (maintains observers, attach, detach, notify) and Observer (update callback interface)",
      "Model, View, and Controller",
      "Producer, Broker, and Consumer",
      "Target, Adaptee, and Adapter"
    ],
    a: 0,
    e: "The Subject maintains a list of Observers and broadcasts state changes by calling observer.update() whenever notifyObservers() is triggered, providing loose one-to-many coupling."
  },
  {
    q: "How does the Observer Pattern handle slow or unresponsive observers to prevent blocking the subject's main thread?",
    o: [
      "By decoupling notification dispatch through an asynchronous event bus or worker thread pool (e.g. Guava EventBus, Spring ApplicationEventMulticaster)",
      "By terminating the subject's JVM thread",
      "By removing slow observers without notifying them",
      "By converting all observers into final static constants"
    ],
    a: 0,
    e: "Synchronous observer dispatch blocks the subject if one observer performs slow I/O. Asynchronous dispatch offloads notifications to background thread pools or messaging queues."
  }
]);

// lld4: Decorator Pattern
QB.add("lld4", [
  {
    q: "How does the Decorator Pattern attach new responsibilities to an object without using class inheritance?",
    o: [
      "By wrapping the original object in a Decorator class that implements the same interface and delegates calls while adding extra behavior before or after",
      "By modifying the bytecode of the class using a JVM agent",
      "By using multiple inheritance in Java",
      "By cloning the object using prototype cloning"
    ],
    a: 0,
    e: "The Decorator implements the same interface as the wrapped component. Calling decorator.action() invokes component.action() plus the added behavior (e.g. EncryptionDecorator, CompressionDecorator)."
  },
  {
    q: "Which standard Java API is the most famous example of the Decorator Pattern?",
    o: [
      "java.io streams (new BufferedReader(new InputStreamReader(new FileInputStream(...))))",
      "java.util.Collections.singleton()",
      "java.lang.Math",
      "java.time.LocalDate"
    ],
    a: 0,
    e: "FileInputStream is the concrete component; BufferedInputStream and InputStreamReader wrap and decorate the underlying stream with buffering and character decoding capabilities."
  }
]);

// lld5: Factory & Abstract Factory
QB.add("lld5", [
  {
    q: "What distinguishes an Abstract Factory from a simple Factory Method?",
    o: [
      "Abstract Factory creates entire families of related or dependent objects (e.g. MacButton + MacCheckbox) without specifying their concrete classes",
      "Factory Method can only instantiate static classes",
      "Abstract Factory can only return primitive integers",
      "Factory Method is for databases; Abstract Factory is for GUI only"
    ],
    a: 0,
    e: "A Factory Method creates a single product by letting subclasses decide which class to instantiate. An Abstract Factory is a factory of factories producing suites of related products."
  }
]);

// lld6: Machine Coding - Parking Lot
QB.add("lld6", [
  {
    q: "In a low-level design for a multi-floor Parking Lot system, how should concurrent slot reservations be safely handled in a multi-threaded server?",
    o: [
      "Use atomic state transitions (CAS) or synchronized/ReentrantLock on slot allocations to prevent race conditions where two cars are assigned the same spot",
      "Store slot assignments in an un-synchronized static HashMap",
      "Allow duplicate bookings and resolve them when cars exit",
      "Assign spots randomly without checking availability"
    ],
    a: 0,
    e: "Under concurrent vehicular ingress, multiple threads query for free spots. Protecting slot state with atomic primitives (e.g. AtomicBoolean isOccupied) or fine-grained locks ensures no two vehicles claim the same space."
  },
  {
    q: "Which design pattern is best suited for computing parking charges across different vehicle types, duration tiers, and peak pricing hours?",
    o: [
      "Strategy Pattern (pluggable ParkingFeeStrategy: HourlyStrategy, FlatRateStrategy, DynamicStrategy)",
      "Singleton Pattern",
      "Prototype Pattern",
      "Memento Pattern"
    ],
    a: 0,
    e: "Parking fee calculation rules vary widely (cars vs trucks, flat-rate vs hourly, weekend surcharges). Encapsulating fee logic inside Strategy implementations keeps the core Ticket and ParkingLot models clean."
  }
]);

// lld12: HashMap Internal Implementation
QB.add("lld12", [
  {
    q: "What is the mathematical purpose of the bitwise spread operation in Java's HashMap: (h = key.hashCode()) ^ (h >>> 16)?",
    o: [
      "To mix the higher 16 bits of the hash into the lower 16 bits, preventing collisions when table capacity is small (e.g. 16) and only lower bits determine bucket index",
      "To convert negative numbers into positive numbers",
      "To encrypt the key for security",
      "To round the hash to the nearest prime number"
    ],
    a: 0,
    e: "Bucket index is computed as (n - 1) & hash. When n is small (e.g. 16), only the lowest 4 bits are used. XORing with h >>> 16 ensures high-order bit entropy influences bucket distribution, reducing cluster collisions."
  },
  {
    q: "When does Java's HashMap trigger a resize / rehash operation?",
    o: [
      "When the total number of key-value pairs exceeds the threshold: capacity * loadFactor (default 16 * 0.75 = 12 entries)",
      "Only when all buckets are completely full",
      "When the first hash collision occurs",
      "When a single bucket length reaches 100"
    ],
    a: 0,
    e: "The load factor (default 0.75) balances space and lookup time. When map.size() > capacity * loadFactor, the bucket array doubles in size (e.g. from 16 to 32) and elements are rehashed."
  }
]);

// lld14: Machine Coding - BookMyShow
QB.add("lld14", [
  {
    q: "In an online movie ticketing system like BookMyShow, how do you prevent two users from booking the same seat simultaneously while allowing a 10-minute payment grace period?",
    o: [
      "Assign the seat a temporary 'LOCKED' state with a TTL timestamp (e.g. in Redis or with distributed lock); if payment fails or expires, the lock releases back to 'AVAILABLE'",
      "Reserve the seat permanently on the first click regardless of payment",
      "Let both users pay and issue a refund to the slower user",
      "Block all other users from opening the entire cinema screen"
    ],
    a: 0,
    e: "Seat states transition from AVAILABLE -> LOCKED (with 10-min TTL) -> BOOKED upon payment confirmation. An atomic lock (e.g. Redis SETNX with expiration) prevents double booking without locking the entire theater."
  }
]);

// lld16: Vending Machine - State Pattern
QB.add("lld16", [
  {
    q: "Why is the State Pattern preferred over nested switch-cases when designing a Vending Machine (Idle, HasMoney, Dispensing, SoldOut)?",
    o: [
      "Each state is encapsulated in its own class implementing a VendingMachineState interface, making state transitions explicit and eliminating brittle, nested if-else ladders",
      "It makes the vending machine execute on a multi-threaded GPU",
      "It eliminates the need for unit tests",
      "The State pattern automatically dispenses money without hardware"
    ],
    a: 0,
    e: "With the State pattern, adding a new state (e.g. 'RefundState' or 'MaintenanceState') simply creates a new class implementing the state actions (insertMoney, selectItem, dispense) without altering existing state code."
  }
]);

// lld28: Singleton Pattern
QB.add("lld28", [
  {
    q: "Why is the 'volatile' keyword mandatory on the instance variable in the Double-Checked Locking Singleton pattern?",
    k: "public class Singleton {\n  private static volatile Singleton instance;\n  public static Singleton getInstance() {\n    if (instance == null) {\n      synchronized (Singleton.class) {\n        if (instance == null) instance = new Singleton();\n      }\n    }\n    return instance;\n  }\n}",
    o: [
      "To prevent instruction reordering by the compiler and CPU, ensuring the constructor finishes initialization before the memory address is published to other threads",
      "To store the instance in native Metaspace instead of the heap",
      "To allow the Singleton to be cloned by reflection",
      "Because synchronized does not work on static methods"
    ],
    a: 0,
    e: "'new Singleton()' involves: 1) allocate memory, 2) execute constructor, 3) point instance to memory. Without volatile, instruction reordering could execute 1 then 3 before 2, letting another thread see a partially initialized, corrupted object."
  },
  {
    q: "What is the most robust, reflection-proof, and serialization-safe way to implement a Singleton in Java according to Effective Java (Joshua Bloch)?",
    o: [
      "A single-element Enum (public enum Singleton { INSTANCE; })",
      "Static inner Bill Pugh holder class",
      "Eager static initialization with private constructor",
      "Double-checked locking with volatile"
    ],
    a: 0,
    e: "Java strictly guarantees that enum constants cannot be instantiated twice, cannot be corrupted by Java Reflection (Constructor.newInstance throws an exception for enums), and provides automatic serialization protection."
  }
]);

// lld31: Command Pattern
QB.add("lld31", [
  {
    q: "How does the Command Pattern enable clean implementation of multi-level Undo/Redo in a text editor or graphic design tool?",
    o: [
      "Each user action is encapsulated as a Command object with execute() and undo() methods, stored in an undo stack; undoing pops the command and executes command.undo()",
      "By saving a full copy of the entire application RAM on every keystroke",
      "By restarting the application from the initial save file",
      "By using the Prototype pattern to clone the entire database"
    ],
    a: 0,
    e: "The Command pattern decouples the invoker (UI buttons/shortcuts) from the receiver (document engine). Storing command instances in history and redo stacks provides lightweight, reversible operational granularity."
  }
]);
