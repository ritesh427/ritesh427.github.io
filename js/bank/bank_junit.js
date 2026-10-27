'use strict';
/* =========================================================
   DevPath Question Bank: JUnit 5 & Mockito Unit Testing
   ========================================================= */

// ju1: Unit Testing Principles & AAA Pattern
QB.add("ju1", [
  {
    q: "What is the primary architectural goal of the Arrange-Act-Assert (AAA) pattern in unit testing?",
    o: [
      "To clearly delineate test setup, invocation of the unit under test, and verification of outcomes for maintainability and readability",
      "To force tests to execute on three separate threads",
      "To execute tests in alphabetical order",
      "To convert JUnit tests into Cucumber Gherkin scenarios"
    ],
    a: 0,
    e: "Arrange: configure preconditions, mocks, and inputs. Act: invoke the method under test. Assert: verify returned values, state changes, and mock interactions."
  },
  {
    q: "According to the F.I.R.S.T. unit testing principles, what does the 'I' stand for?",
    o: [
      "Isolated / Independent (tests should not depend on other tests and can run in any order)",
      "Integrated with database",
      "Iterative across multiple threads",
      "Immutable test state"
    ],
    a: 0,
    e: "F.I.R.S.T.: Fast, Independent (no shared mutable state between tests), Repeatable (same result in any environment), Self-validating (boolean pass/fail), and Timely (written alongside or before code)."
  }
]);

// ju2: JUnit 5 Modular Architecture
QB.add("ju2", [
  {
    q: "What are the three core foundational sub-projects that comprise JUnit 5?",
    o: [
      "JUnit Platform (test discovery and execution engine), JUnit Jupiter (programming model and extension API), and JUnit Vintage (backward compatibility for JUnit 3 and 4)",
      "JUnit Core, JUnit UI, and JUnit Mockito",
      "JUnit TestNG, JUnit AssertJ, and JUnit Hamcrest",
      "JUnit Client, JUnit Broker, and JUnit Server"
    ],
    a: 0,
    e: "JUnit Platform launches test engines on the JVM and integrates with IDEs/build tools. JUnit Jupiter provides the modern annotations (@Test, @ExtendWith). JUnit Vintage runs legacy JUnit 3/4 tests."
  }
]);

// ju3: Lifecycle & Parallel Execution
QB.add("ju3", [
  {
    q: "In JUnit 5, what is the default test instance lifecycle behavior?",
    o: [
      "@TestInstance(Lifecycle.PER_METHOD): JUnit instantiates a brand new instance of the test class for EVERY single @Test method to prevent state leakage",
      "@TestInstance(Lifecycle.PER_CLASS): one instance is reused for all tests",
      "All test methods share a single global static instance",
      "Instances are created only once per JVM session"
    ],
    a: 0,
    e: "By default, JUnit 5 creates a fresh test class instance before running each test method. This ensures complete isolation between tests and prevents side effects from shared instance fields."
  },
  {
    q: "Why must @BeforeAll and @AfterAll methods be declared static by default in JUnit 5?",
    o: [
      "Because the test class instance does not exist yet before the first test method runs under Lifecycle.PER_METHOD",
      "Because non-static methods cannot access the console",
      "Because static methods run faster on multi-core processors",
      "It is a restriction imposed by the Java Virtual Machine bytecode verifier"
    ],
    a: 0,
    e: "Under PER_METHOD, instances are created per method. @BeforeAll executes before any instance exists, so it must be static (unless configured with @TestInstance(Lifecycle.PER_CLASS))."
  }
]);

// ju4: JUnit 5 Assertions
QB.add("ju4", [
  {
    q: "What is the major advantage of using assertAll() (grouped assertions) in JUnit 5?",
    o: [
      "All assertions inside the lambda block are executed and reported, even if one or more individual assertions fail",
      "It runs assertions in parallel on separate threads",
      "It automatically repairs broken code",
      "It converts checked exceptions to unchecked exceptions"
    ],
    a: 0,
    e: "Traditional sequential assertions stop immediately on the first failure, hiding subsequent errors. assertAll() evaluates all assertions and presents a comprehensive failure summary report."
  },
  {
    q: "How do you verify in JUnit 5 that a specific exception and message are thrown?",
    k: "Exception ex = assertThrows(IllegalArgumentException.class, () -> {\n  account.withdraw(-50);\n});\nassertEquals(\"Amount must be positive\", ex.getMessage());",
    o: [
      "Using assertThrows(), which returns the thrown exception instance for further field and message assertions",
      "Using @Test(expected = IllegalArgumentException.class) like in JUnit 4",
      "Wrapping the call in a try-catch block and asserting in the catch",
      "Exceptions cannot be tested in JUnit 5"
    ],
    a: 0,
    e: "JUnit 5 deprecated @Test(expected=...). assertThrows() takes an Executable lambda, asserts the thrown class, and returns the Throwable instance for message and cause assertions."
  }
]);

// ju7: Parametrized Tests
QB.add("ju7", [
  {
    q: "Which source annotation allows injecting arguments directly from a static method returning a Stream<Arguments>?",
    o: [
      "@MethodSource",
      "@ValueSource",
      "@CsvSource",
      "@EnumSource"
    ],
    a: 0,
    e: "@MethodSource(\"provideTestCases\") binds to a static factory method returning Stream<Arguments>, Collection<Arguments>, or an array, allowing rich, multi-argument parameterized test suites."
  }
]);

// ju15: Mockito @Mock vs @InjectMocks
QB.add("ju15", [
  {
    q: "In a test class using MockitoExtension, what is the role of @Mock vs @InjectMocks?",
    k: "@ExtendWith(MockitoExtension.class)\nclass OrderServiceTest {\n  @Mock PaymentGateway gateway;\n  @Mock OrderRepository repository;\n  @InjectMocks OrderService orderService;\n}",
    o: [
      "@Mock creates simulated mock instances of the collaborators; @InjectMocks creates a real instance of OrderService and injects the created mocks into it",
      "@InjectMocks mocks the entire class; @Mock creates real objects",
      "Both create identical mock objects",
      "@InjectMocks is required only for Spring Boot @SpringBootTest"
    ],
    a: 0,
    e: "@Mock creates simulated dependencies. @InjectMocks instantiates the real class under test via constructor, setter, or field injection, wiring the mocked collaborators into it."
  },
  {
    q: "What is the critical risk of relying on Mockito's field injection for @InjectMocks if constructors are missing?",
    o: [
      "Mockito silently skips injection via reflection if names or types do not match, leaving internal fields null without throwing an error at test startup",
      "Field injection causes the JVM to run out of memory",
      "It disables JUnit test discovery",
      "It causes all test methods to pass automatically"
    ],
    a: 0,
    e: "If field injection fails to find an exact match, Mockito leaves the field null, leading to mysterious NullPointerExceptions during execution. Explicit constructor injection is always preferred."
  }
]);

// ju17: Mockito Stubbing
QB.add("ju17", [
  {
    q: "When stubbing methods on a Mockito Spy (@Spy), why should doReturn().when() be used instead of when().thenReturn()?",
    o: [
      "when(spy.method()).thenReturn() actually calls the real method once before stubbing takes effect; doReturn().when() bypasses the real method execution completely",
      "doReturn() runs faster on 64-bit systems",
      "when().thenReturn() only works on interfaces",
      "There is no difference between them"
    ],
    a: 0,
    e: "A spy delegates to the real object. In when(spy.calc()).thenReturn(10), spy.calc() executes during the 'when()' call! If the real method has side effects or throws an exception, the test breaks. doReturn(10).when(spy).calc() is safe."
  },
  {
    q: "What causes Mockito to throw an UnnecessaryStubbingException in modern strict mode?",
    o: [
      "A mock method was stubbed in test setup with when(...).thenReturn(...), but that stubbed method was never actually invoked by the code under test",
      "A test ran for more than 5 seconds",
      "A class has more than 10 mocked methods",
      "Two mocks return the same integer value"
    ],
    a: 0,
    e: "Mockito's Strict Stubs (enabled by @ExtendWith(MockitoExtension.class)) enforces clean tests. Unused stubbings signal stale test setup, dead test code, or misunderstandings of the production code flow."
  }
]);

// ju18: Mockito Verification
QB.add("ju18", [
  {
    q: "How do you verify with Mockito that an audit service method was called exactly twice with any string argument?",
    o: [
      "verify(auditService, times(2)).logAction(anyString());",
      "assertCalled(auditService.logAction(), 2);",
      "auditService.verify(2);",
      "verify(auditService).logAction(2);"
    ],
    a: 0,
    e: "verify(mock, times(n)).methodName(argumentMatcher) asserts the exact invocation frequency. Mockito provides VerificationModes like times(n), never(), atLeastOnce(), and atMost(n)."
  },
  {
    q: "What is the purpose of Mockito's ArgumentCaptor<T>?",
    o: [
      "To capture and inspect the actual arguments passed into a mock method during execution for deep assertions (e.g. verifying fields of an internally constructed DTO)",
      "To prevent exceptions from bubbling up to the test runner",
      "To convert method arguments to JSON strings",
      "To capture console System.out statements"
    ],
    a: 0,
    e: "When a method constructs an internal object and passes it to a collaborator, the test cannot inspect it directly. ArgumentCaptor captures the instance passed to the mock for detailed assertion."
  }
]);

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
