# populate_lld.py - Generates interview-grade questions for 31 missing LLD topics
import os

BANKS_DIR = '/Users/ritesh/Developer/experiments/ritesh427.github.io/js/bank'

lld_extra = '''
// lld7: Tic Tac Toe Game
QB.add("lld7", [
  {
    q: "In an N x N Tic Tac Toe game, what is the most optimal time complexity to verify if a player has won after making a move?",
    o: [
      "O(N^2) by scanning the entire grid",
      "O(N) by checking only the row, column, and diagonals of the placed piece",
      "O(1) by maintaining row, column, and diagonal counter arrays per player",
      "O(log N) using a binary search tree of moves"
    ],
    a: 2,
    e: "By tracking score tallies per row, col, and the two diagonals (+1 for Player 1, -1 for Player 2), checking if |count| == N takes O(1) time and O(N) space, avoiding scanning the grid."
  },
  {
    q: "When designing the classes for Tic Tac Toe, which design principle is upheld by modeling Piece as an abstract class (or enum) with PieceX and PieceO?",
    o: [
      "Open/Closed Principle (OCP), allowing support for new piece types or 3+ players without rewriting Board logic",
      "Single Responsibility Principle only",
      "Interface Segregation Principle only",
      "Liskov Substitution Principle is violated"
    ],
    a: 0,
    e: "Separating Piece into an abstraction (or strategy) ensures the Board and Game engine depend on Piece rather than hardcoded char literals, adhering to OCP."
  }
]);

// lld8: Elevator System
QB.add("lld8", [
  {
    q: "In an Elevator System LLD, which scheduling algorithm is typically used by an individual elevator car to serve floor requests efficiently?",
    o: [
      "First Come First Served (FCFS)",
      "LOOK / SCAN algorithm (Elevator Algorithm), serving all requests in the current direction before reversing",
      "Shortest Job Next (SJN)",
      "Round Robin with a 10-second quantum"
    ],
    a: 1,
    e: "The SCAN/LOOK algorithm moves the elevator in one direction, stopping at all requested floors in path, then reverses once no further requests exist in that direction. This prevents starvation and minimizes mechanical wear."
  },
  {
    q: "How should an external floor call button (Up/Down) be routed to multiple elevator cars in a high-rise building?",
    o: [
      "Randomly assign to any idle elevator",
      "Via an ElevatorController / Dispatcher applying an optimization strategy (e.g. proximity, current direction, load capacity)",
      "Broadcast to all elevators and let the fastest motor respond",
      "Keep floor buttons hardwired to a single dedicated elevator shaft"
    ],
    a: 1,
    e: "An ElevatorController acts as the central coordinator (Mediator / Strategy pattern), evaluating each car's state (direction, current floor, queue depth) to dispatch the optimal car."
  }
]);

// lld9: Car Rental System
QB.add("lld9", [
  {
    q: "In a Car Rental System LLD (like Zoomcar or Hertz), how do you prevent double-booking when two concurrent users attempt to book the same vehicle for overlapping time slots?",
    o: [
      "By relying on client-side JavaScript validation",
      "Using pessimistic DB row locking (SELECT FOR UPDATE) or an atomic reservation lock in Redis with TTL during checkout",
      "By having the user re-enter credit card details",
      "Double booking cannot happen in object-oriented systems"
    ],
    a: 1,
    e: "Concurrent reservations require transactional safety. Using database pessimistic locks or distributed Redis mutexes (Redlock) ensures that only one checkout thread can hold the vehicle reservation for the requested time range."
  },
  {
    q: "Which design pattern is best suited for calculating dynamic car rental pricing based on base rate, duration, weekend surcharge, and insurance add-ons?",
    o: [
      "Singleton Pattern",
      "Decorator Pattern or Strategy Pattern",
      "Prototype Pattern",
      "Flyweight Pattern"
    ],
    a: 1,
    e: "The Strategy Pattern lets you swap pricing algorithms (seasonal, weekend, hourly), while the Decorator Pattern allows dynamic stacking of billable features (GPS, infant seat, comprehensive insurance)."
  }
]);

// lld10: Chain of Responsibility Pattern
QB.add("lld10", [
  {
    q: "In the Chain of Responsibility design pattern, how does a request pass through the chain?",
    o: [
      "Every handler in the chain must always execute in parallel using threads",
      "A handler either processes the request or delegates it to the next successor handler in the chain",
      "The client invokes all handlers directly via reflection",
      "The request is broadcast via JMS topic to all consumers"
    ],
    a: 1,
    e: "The Chain of Responsibility decouples the sender of a request from its receivers by giving multiple objects a chance to handle the request along a sequential successor chain."
  },
  {
    q: "Which standard Java / Spring framework feature is a classic real-world example of Chain of Responsibility?",
    o: [
      "Java StringBuilder",
      "Spring Security FilterChain and Servlet Filters (javax.servlet.Filter / FilterChain.doFilter)",
      "Spring @Autowired dependency injection",
      "Java Collections.sort()"
    ],
    a: 1,
    e: "Servlet FilterChain (and Spring SecurityFilterChain) is the textbook implementation: each filter inspects the request and either writes a response or invokes chain.doFilter(req, res)."
  }
]);

// lld11: Snake and Ladder Game
QB.add("lld11", [
  {
    q: "In an LLD for Snake and Ladder, what is the cleanest object-oriented way to represent snakes and ladders on the Board?",
    o: [
      "Hardcode an if-else chain inside the GameLoop class",
      "Model a 'Jump' class with 'start' and 'end' coordinates; a snake has start > end, while a ladder has start < end",
      "Store two parallel integer arrays in a static global class",
      "Use SQL triggers on an in-memory SQLite table"
    ],
    a: 1,
    e: "Modeling Snake and Ladder as instances of a polymorphic or unified 'Jump' entity (where start > end is a snake and start < end is a ladder) simplifies board logic: cell.getJump() ? jump.getEnd() : position."
  },
  {
    q: "Which data structure is ideal for managing the turn sequence of players in a multiplayer Snake and Ladder game?",
    o: [
      "Stack (LIFO)",
      "Queue or Deque (FIFO: poll player, take turn, add back to end of queue)",
      "Binary Search Tree",
      "HashSet"
    ],
    a: 1,
    e: "A FIFO Queue (like ArrayDeque) allows round-robin turn management: player = queue.poll(); int roll = dice.roll(); move(player, roll); queue.offer(player)."
  }
]);

// lld13: Proxy Design Pattern
QB.add("lld13", [
  {
    q: "What is the primary architectural difference between a Proxy Pattern and a Decorator Pattern?",
    o: [
      "A Proxy controls access to the underlying object (e.g. lazy loading, security, caching, remote invocation), whereas a Decorator adds new responsibilities/behavior dynamically",
      "Proxy cannot implement the same interface as the target",
      "Decorator always creates remote network sockets",
      "There is no difference; they are exact synonyms"
    ],
    a: 0,
    e: "While both wrap a target object and share its interface, a Proxy controls the lifecycle or access to the real subject (lazy loading, virtual proxy, auth check), while a Decorator enhances or adds responsibilities."
  },
  {
    q: "How does Spring Boot create AOP proxies for classes that do NOT implement any interface?",
    o: [
      "JDK Dynamic Proxies (java.lang.reflect.Proxy)",
      "CGLIB (Code Generation Library) byte-code subclassing",
      "Java Native Interface (JNI)",
      "Spring cannot proxy classes without interfaces"
    ],
    a: 1,
    e: "JDK Dynamic Proxy requires interfaces. For concrete classes without interfaces, Spring utilizes CGLIB to generate a subclass proxy at runtime, overriding public methods to inject advice."
  }
]);

// lld15: Null Object Pattern
QB.add("lld15", [
  {
    q: "What problem does the Null Object Pattern solve in low-level object-oriented design?",
    o: [
      "It eliminates the need for repetitive 'if (obj != null)' checks by providing a default do-nothing implementation of an interface",
      "It allows Java pointers to bypass JVM memory allocation",
      "It forces the garbage collector to immediately purge unreferenced objects",
      "It replaces Java Optional with raw primitives"
    ],
    a: 0,
    e: "The Null Object Pattern provides a concrete object that conforms to the expected interface but does nothing (or provides sensible no-op defaults), eliminating NullPointerExceptions and null-checking boilerplate."
  }
]);

// lld17: LLD of ATM (Automated Teller Machine)
QB.add("lld17", [
  {
    q: "Which design pattern is best suited for modeling an ATM's lifecycle (Idle -> CardInserted -> PinValidated -> CashDispensing)?",
    o: [
      "State Pattern",
      "Observer Pattern",
      "Builder Pattern",
      "Visitor Pattern"
    ],
    a: 0,
    e: "The State Pattern encapsulates ATM state-specific behaviors into dedicated state classes (IdleState, HasCardState, PinEnteredState, DispensingState), avoiding massive switch/if-else logic."
  },
  {
    q: "Which pattern should be used inside the ATM to dispense cash using denominations like $2000, $500, and $100 notes?",
    o: [
      "Chain of Responsibility Pattern",
      "Flyweight Pattern",
      "Adapter Pattern",
      "Prototype Pattern"
    ],
    a: 0,
    e: "Each CashDispenser (TwoThousandDispenser -> FiveHundredDispenser -> HundredDispenser) is linked in a Chain of Responsibility to dispense its quota and pass the remaining balance down the chain."
  }
]);

// lld18: Chess Mock Interview
QB.add("lld18", [
  {
    q: "In an LLD for Chess, how should piece-specific movement validation be implemented according to SOLID principles?",
    o: [
      "A single giant switch statement in the Board class checking every piece type",
      "An abstract 'Piece' class with an abstract boolean canMove(Board, Spot start, Spot end) method overridden by Pawn, Knight, Bishop, etc.",
      "By storing move rules inside a JSON database file",
      "Using regex pattern matching on algebraic chess notation"
    ],
    a: 1,
    e: "Polymorphic movement validation: each subclass of Piece (Knight, Rook, etc.) encapsulates its own movement invariants, adhering to Single Responsibility and Open/Closed principles."
  },
  {
    q: "How should special moves like Castling and En Passant be validated in an object-oriented Chess engine?",
    o: [
      "They cannot be modeled in OOP",
      "By maintaining move history (e.g. piece hasMoved flag, and lastMove state on the Board)",
      "By restarting the chess game if a pawn moves two squares",
      "By using multi-threading to compute moves in advance"
    ],
    a: 1,
    e: "Castling requires knowing neither King nor Rook has moved and intermediate squares are clear; En Passant requires knowing the opponent's adjacent pawn advanced two squares on the immediately preceding turn."
  }
]);

// lld19: File System (Composite Pattern)
QB.add("lld19", [
  {
    q: "Which design pattern is the textbook solution for modeling a hierarchical File System containing Files and Folders?",
    o: [
      "Composite Pattern",
      "Abstract Factory Pattern",
      "Memento Pattern",
      "Bridge Pattern"
    ],
    a: 0,
    e: "The Composite Pattern allows treating individual objects (File) and compositions of objects (Directory containing Files/Directories) uniformly via a common FileSystemNode interface."
  },
  {
    q: "In a Composite File System, how is the total size of a Directory calculated?",
    o: [
      "The Directory stores a static fixed constant",
      "The Directory recursively iterates over its child FileSystemNode elements, summing their getSize() results",
      "By querying the Linux kernel /proc filesystem directly",
      "Directories cannot have a size"
    ],
    a: 1,
    e: "Polymorphic recursion: Directory.getSize() iterates over List<FileSystemNode> children calling child.getSize(), where File returns its byte length and subdirectories recursively sum their contents."
  }
]);

// lld20: Adapter Pattern
QB.add("lld20", [
  {
    q: "When should an engineer apply the Adapter Pattern in production code?",
    o: [
      "When adding caching to an existing slow database query",
      "When integrating an incompatible third-party or legacy class whose interface does not match the client's expected target interface",
      "When creating a deep copy of a complex object graph",
      "When restricting a class to a single global instance"
    ],
    a: 1,
    e: "The Adapter acts as a translator/wrapper between two incompatible interfaces, enabling collaboration without modifying the client code or the third-party legacy library."
  }
]);

// lld21: Splitwise LLD
QB.add("lld21", [
  {
    q: "In a Splitwise LLD, which graph algorithm can be applied to simplify group debt balances and minimize the total number of cash transactions?",
    o: [
      "Dijkstra's Shortest Path",
      "Min-Cash Flow Algorithm (Greedy matching of max net debtor and max net creditor)",
      "Kruskal's Minimum Spanning Tree",
      "Breadth-First Search (BFS)"
    ],
    a: 1,
    e: "The Min-Cash Flow algorithm computes net balances for all members (Credit - Debit), finds the largest creditor and largest debtor, settles the minimum of the two, and repeats until all balances reach zero."
  },
  {
    q: "How should different expense splitting strategies (EQUAL, EXACT, PERCENTAGE) be modeled in Splitwise?",
    o: [
      "Strategy Pattern, with a common ExpenseSplitStrategy interface implementing validate() and calculateSplits()",
      "Single massive switch statement in User class",
      "Copy-pasting the Expense class for each split variation",
      "By letting users write SQL queries directly"
    ],
    a: 0,
    e: "The Strategy Pattern isolates the algorithms for validating and dividing expenses (e.g. checking that percentages sum to 100% or exact amounts equal total cost) into distinct interchangeable strategy classes."
  }
]);

// lld23: Builder Design Pattern
QB.add("lld23", [
  {
    q: "What anti-pattern does the Builder Pattern solve when constructing complex domain entities?",
    o: [
      "Telescoping Constructor anti-pattern (multiple overloaded constructors with many confusing parameters)",
      "Deadlock in multi-threading",
      "Memory leaks from static collections",
      "N+1 query problem in ORMs"
    ],
    a: 0,
    e: "Telescoping constructors (e.g. Car(engine, wheels, seats, gps, sunroof, color)) lead to error-prone calls. Builder provides a fluent API, step-by-step construction, and creates immutable objects."
  },
  {
    q: "Why is the target class constructor typically made 'private' when paired with a static inner Builder class?",
    o: [
      "To prevent reflection attacks",
      "To force clients to instantiate the object exclusively through the Builder, guaranteeing validation invariants",
      "To improve garbage collection speed",
      "Java does not allow public constructors in classes with inner classes"
    ],
    a: 1,
    e: "A private constructor prevents callers from bypassing the builder's validation rules and ensures mandatory fields are validated before the immutable object is instantiated via builder.build()."
  }
]);

// lld24: Cricbuzz / ESPN LLD
QB.add("lld24", [
  {
    q: "In a Cricbuzz LLD, which design pattern should be used to update live commentary, scoreboard UI, and mobile notifications whenever a new ball is bowled?",
    o: [
      "Observer Pattern (Publish-Subscribe)",
      "Flyweight Pattern",
      "Singleton Pattern",
      "Adapter Pattern"
    ],
    a: 0,
    e: "The Match acts as the Subject/Observable; commentary services, push notification dispatchers, and live scoreboard webhooks subscribe as Observers to receive automatic event updates per ball."
  }
]);

// lld25: Facade Design Pattern
QB.add("lld25", [
  {
    q: "What is the primary objective of the Facade Design Pattern?",
    o: [
      "To provide a simplified, high-level unified interface to a complex subsystem of classes",
      "To allow subclasses to override part of an algorithm without changing its structure",
      "To ensure thread-safe singleton initialization",
      "To convert an interface of a class into another interface"
    ],
    a: 0,
    e: "A Facade defines a simple interface that masks the complexity of a complex subsystem (e.g. an OrderPlacementFacade orchestrating InventoryService, PaymentGateway, ShippingService, and EmailService)."
  }
]);

// lld26: Bridge Design Pattern
QB.add("lld26", [
  {
    q: "When should the Bridge Pattern be chosen over class inheritance?",
    o: [
      "When you have two orthogonal dimensions of variation (e.g. Shape hierarchy and DrawingAPI hierarchy) and want to avoid an M x N combinatorial explosion of subclasses",
      "When an object needs to undo its previous state changes",
      "When you need to serialize objects to JSON",
      "When only a single instance of a class must exist"
    ],
    a: 0,
    e: "The Bridge Pattern decouples an abstraction from its implementation by replacing deep inheritance with object composition: Shape holds a reference to a DrawingAPI, letting both hierarchies evolve independently."
  }
]);

// lld27: All Creational Patterns
QB.add("lld27", [
  {
    q: "Which creational pattern creates new objects by cloning an existing configured instance rather than instantiating via 'new'?",
    o: [
      "Prototype Pattern",
      "Abstract Factory Pattern",
      "Builder Pattern",
      "Factory Method Pattern"
    ],
    a: 0,
    e: "The Prototype Pattern uses Java's clone() or copy constructors to duplicate existing pre-configured objects, which is especially useful when object creation is computationally costly."
  },
  {
    q: "How does Abstract Factory differ from Factory Method?",
    o: [
      "Factory Method creates a single product via inheritance; Abstract Factory produces families of related/dependent products via composition",
      "Abstract Factory can only produce singleton objects",
      "Factory Method is obsolete in modern Java",
      "They are identical patterns with different names"
    ],
    a: 0,
    e: "Factory Method uses an inheritance method to return one product (e.g. createButton()). Abstract Factory is an interface with multiple methods creating a family of related products (e.g. createButton(), createCheckbox())."
  }
]);

// lld29: Inventory Management System
QB.add("lld29", [
  {
    q: "In an e-commerce Inventory Management System LLD, how should an item reserve be handled during checkout to avoid stock depletion without blocking concurrent shoppers?",
    o: [
      "Reserve inventory with a temporary TTL lease (e.g. 10 minutes) in Redis or a DB reservation table; auto-release if payment is not finalized",
      "Deduct stock permanently as soon as a user clicks 'Add to Cart'",
      "Synchronize the entire web application using a static synchronized method",
      "Stock should only be checked after payment confirmation"
    ],
    a: 0,
    e: "A temporary reservation lease (hold) protects stock while the customer enters payment credentials. If the checkout succeeds, the hold converts to sold; if it times out or fails, the hold expires automatically."
  }
]);

// lld30: Word Processor (Flyweight Pattern)
QB.add("lld30", [
  {
    q: "In designing a Word Processor handling millions of characters, how does the Flyweight Pattern minimize memory footprint?",
    o: [
      "By separating character state into intrinsic state (shared glyph/font family stored once) and extrinsic state (position, color passed by caller)",
      "By compressing the entire document with gzip in RAM",
      "By loading only one paragraph into RAM at a time",
      "By converting all text to ASCII bytecode"
    ],
    a: 0,
    e: "Intrinsic state (e.g. character glyph 'A', font style) is immutable and shared across all instances via a FlyweightFactory. Extrinsic state (X, Y coordinates, line number) is stored externally in the document layout."
  }
]);

// lld32: All Structural Patterns
QB.add("lld32", [
  {
    q: "Which structural design pattern is used to attach new responsibilities to an object dynamically without modifying its existing code or breaking other instances?",
    o: [
      "Decorator Pattern",
      "Adapter Pattern",
      "Facade Pattern",
      "Proxy Pattern"
    ],
    a: 0,
    e: "The Decorator Pattern wraps the original object with decorator classes that conform to the same interface, layering on additional behaviors (e.g. Java I/O BufferedInputStream wrapping FileInputStream)."
  }
]);

// lld33: Iterator Pattern
QB.add("lld33", [
  {
    q: "What causes a ConcurrentModificationException when iterating over a standard java.util.ArrayList?",
    o: [
      "The underlying collection was modified structurally (added/removed) without using the iterator's own remove() method, causing modCount != expectedModCount",
      "The CPU ran out of thread registers",
      "The list contained null elements",
      "The elements were not comparable"
    ],
    a: 0,
    e: "Fail-fast iterators verify that modCount == expectedModCount on every next() call. Any structural modification to the list outside the Iterator's methods throws ConcurrentModificationException immediately."
  }
]);

// lld34: Mediator Pattern
QB.add("lld34", [
  {
    q: "How does the Mediator Pattern reduce chaotic dependencies between communicating objects?",
    o: [
      "By preventing objects from referring to each other directly; instead, they communicate through a central mediator object",
      "By forcing all classes to inherit from a single superclass",
      "By converting all method calls into HTTP REST endpoints",
      "By storing all object variables as public static fields"
    ],
    a: 0,
    e: "The Mediator encapsulates how a set of objects interact, fostering loose coupling by keeping objects from referring to each other explicitly (e.g. Air Traffic Control tower coordinating airplanes)."
  }
]);

// lld35: Apply Coupon App
QB.add("lld35", [
  {
    q: "When building an Apply Coupon feature with stackable rules (Percentage off, Flat $ off, Category specific), which pattern combination provides the cleanest extensibility?",
    o: [
      "Decorator Pattern (wrapping base cart with discount decorators) or Strategy Pattern (discount evaluation pipeline)",
      "Singleton and Prototype",
      "Flyweight and Memento",
      "Visitor and Interpreter exclusively"
    ],
    a: 0,
    e: "Decorator allows stacking discounts (PercentageDiscountDecorator wrapping FlatDiscountDecorator). Alternatively, a Chain of Responsibility / Strategy pipeline evaluates coupon eligibility and computes net totals."
  }
]);

// lld36: Visitor Pattern
QB.add("lld36", [
  {
    q: "What fundamental problem does the Visitor Pattern solve?",
    o: [
      "It allows adding new operations to existing class hierarchies without modifying their source code, utilizing Double Dispatch",
      "It provides faster database connections",
      "It caches expensive method returns",
      "It makes private variables public at runtime"
    ],
    a: 0,
    e: "Double dispatch allows element.accept(visitor) to call visitor.visit(this). New operations (e.g. exportToXml, calculateTax) can be introduced simply by creating new Visitor implementations without touching the Element classes."
  }
]);

// lld37: MVC Pattern
QB.add("lld37", [
  {
    q: "In the Model-View-Controller architecture, what is the strict responsibility of the Controller?",
    o: [
      "Handling user input/requests, invoking business logic on the Model, and selecting the appropriate View for presentation",
      "Directly rendering HTML canvas pixels",
      "Managing database table schema migrations",
      "Storing persistent records on disk"
    ],
    a: 0,
    e: "The Controller acts as the orchestrator: it parses incoming requests, coordinates business models / services, and returns view representations or data payloads (DSO/JSON) to the client."
  }
]);

// lld38: Memento Pattern
QB.add("lld38", [
  {
    q: "Which three roles constitute the Memento Pattern to implement Undo/Redo capability without violating encapsulation?",
    o: [
      "Originator (creates snapshot), Memento (stores state privately), and Caretaker (safekeeps history/snapshots)",
      "Model, View, Controller",
      "Client, Adapter, Adaptee",
      "Subject, Observer, ConcreteObserver"
    ],
    a: 0,
    e: "Originator creates a Memento holding its private state. The Caretaker stores the list of Mementos without inspecting their internal contents, returning a Memento to the Originator to restore state during Undo."
  }
]);

// lld39: Template Method Pattern
QB.add("lld39", [
  {
    q: "How does the Template Method Pattern enforce algorithm structure while allowing customization?",
    o: [
      "The base class defines the algorithm skeleton in a 'final' method and calls primitive abstract hook methods that subclasses override",
      "By using Java dynamic proxies on interface methods",
      "By declaring all class fields as volatile",
      "By passing lambda functions to constructors"
    ],
    a: 0,
    e: "Template Method defines the immutable steps of an algorithm in a templateMethod() (often declared final), delegating individual steps (hooks or abstract methods) to concrete subclasses ('Hollywood Principle')."
  }
]);

// lld41: Interpreter Pattern
QB.add("lld41", [
  {
    q: "In what scenario is the Interpreter Pattern specifically designed to be used?",
    o: [
      "When evaluating sentences or expressions in a formal domain-specific grammar (e.g. math expression evaluators, SQL WHERE clause parsers)",
      "When translating Java bytecode to native C++ code",
      "When rendering UI components on mobile screens",
      "When hashing passwords with bcrypt"
    ],
    a: 0,
    e: "The Interpreter Pattern defines a grammar representation for a language along with an interpreter that uses the representation to evaluate expressions (composed of TerminalExpression and NonTerminalExpression nodes)."
  }
]);

// lld42: Payment Gateway LLD
QB.add("lld42", [
  {
    q: "Why is an 'Idempotency-Key' HTTP header essential in Payment Gateway integration LLD?",
    o: [
      "To prevent double-charging the customer if a network timeout occurs and the client retries the payment request",
      "To encrypt credit card numbers",
      "To bypass two-factor authentication (2FA)",
      "To speed up database indexing"
    ],
    a: 0,
    e: "Network drops can cause clients to retry payment requests. If the gateway receives a duplicate request with the same Idempotency-Key, it returns the cached result of the original transaction rather than processing a second charge."
  },
  {
    q: "Which design pattern is best for switching seamlessly between payment aggregators like Stripe, Razorpay, and PayPal?",
    o: [
      "Strategy Pattern",
      "Memento Pattern",
      "Composite Pattern",
      "Flyweight Pattern"
    ],
    a: 0,
    e: "Strategy defines a common PaymentService interface (processPayment(), refund()). Concrete strategies (StripeStrategy, RazorpayStrategy) encapsulate vendor-specific APIs, allowing seamless runtime routing."
  }
]);

// lld43: Object Pool Pattern
QB.add("lld43", [
  {
    q: "What problem does the Object Pool Pattern (e.g. HikariCP database connection pool) address?",
    o: [
      "The excessive overhead of repeatedly instantiating and destroying heavyweight resources (like TCP sockets and DB connections)",
      "Garbage collection fragmentation for small short-lived objects",
      "Replacing multi-threading with asynchronous callbacks",
      "Converting relational tables into NoSQL documents"
    ],
    a: 0,
    e: "Instantiating network connections and threads is expensive. An Object Pool manages a pool of reusable initialized objects: borrowing an object, using it, and returning it to the pool instead of destroying it."
  }
]);

// lld44: Meeting Scheduler LLD
QB.add("lld44", [
  {
    q: "In a Meeting Scheduler LLD (like Google Calendar / Outlook), what data structure or algorithm is most efficient for detecting time slot conflicts?",
    o: [
      "Interval Tree or Segment Tree, or checking overlapping intervals with [startA < endB && startB < endA]",
      "Breadth-First Search on a sparse graph",
      "Hashing intervals into an MD5 checksum",
      "Sorting all meetings by room name alphabetically"
    ],
    a: 0,
    e: "Two time intervals [s1, e1] and [s2, e2] overlap if and only if s1 < e2 and s2 < e1. An Interval Tree enables O(log N) lookup to find all existing booked meetings that conflict with a proposed meeting interval."
  }
]);
'''

with open(os.path.join(BANKS_DIR, 'bank_lld.js'), 'a', encoding='utf-8') as f:
    f.write(lld_extra)

print('Successfully appended 31 missing LLD topics to bank_lld.js!')
