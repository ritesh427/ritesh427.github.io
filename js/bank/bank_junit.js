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
