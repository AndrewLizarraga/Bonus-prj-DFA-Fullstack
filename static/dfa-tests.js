const dfaTests = {
  dfa1: [
    { input: "", expected: false, note: "no 1 present" },
    { input: "0", expected: false, note: "no 1 present" },
    { input: "1", expected: true, note: "has 1, zero 0s after last 1" },
    { input: "10", expected: false, note: "one 0 after last 1" },
    { input: "100", expected: true, note: "two 0s after last 1" },
    { input: "101", expected: true, note: "last 1 resets zero count after it" },
    { input: "1010", expected: false, note: "one 0 after last 1" },
    { input: "10100", expected: true, note: "two 0s after last 1" },
  ],

  dfa2: [
    { input: "", expected: true, note: "zero 1s is even" },
    { input: "0", expected: true, note: "still zero 1s" },
    { input: "1", expected: false, note: "one 1" },
    { input: "11", expected: true, note: "two 1s" },
    { input: "101", expected: true, note: "two 1s" },
    { input: "111", expected: false, note: "three 1s" },
  ],

  dfa3: [
    { input: "", expected: false, note: "does not end with 0" },
    { input: "0", expected: true },
    { input: "1", expected: false },
    { input: "10", expected: true },
    { input: "101", expected: false },
    { input: "1110", expected: true },
  ],

  dfa4: [
    { input: "", expected: false, note: "zero 0s is even" },
    { input: "0", expected: true, note: "one 0 is odd" },
    { input: "00", expected: false, note: "two 0s is even" },
    { input: "1", expected: false, note: "zero 0s" },
    { input: "101", expected: true, note: "one 0" },
    { input: "1001", expected: false, note: "two 0s" },
  ],

  dfa5: [
    { input: "", expected: false },
    { input: "0", expected: false },
    { input: "1", expected: false },
    { input: "01", expected: true, note: "contains 01" },
    { input: "101", expected: true, note: "contains 01" },
    { input: "0011", expected: true, note: "contains 01" },
    { input: "111", expected: false, note: "never gets 01" },
    { input: "000", expected: false, note: "never gets 01" },
  ],

  dfa6: [
    { input: "", expected: true, note: "zero 0s and zero 1s are both even" },
    { input: "0", expected: false },
    { input: "1", expected: false },
    { input: "01", expected: false, note: "one 0 and one 1" },
    { input: "0011", expected: true, note: "two 0s and two 1s" },
    { input: "0101", expected: true, note: "two 0s and two 1s" },
    { input: "1111", expected: true, note: "zero 0s and four 1s" },
    { input: "110", expected: false, note: "one 0 and two 1s" },
  ],

  dfa7: [
    { input: "", expected: false, note: "does not start with 1" },
    { input: "1", expected: true },
    { input: "10", expected: true },
    { input: "111", expected: true },
    { input: "0", expected: false },
    { input: "01", expected: false },
    { input: "0011", expected: false },
  ],

  dfa8: [
    { input: "", expected: true, note: "empty string interpreted as 0" },
    { input: "0", expected: true, note: "0 is divisible by 3" },
    { input: "1", expected: false, note: "1 is not divisible by 3" },
    { input: "10", expected: false, note: "2 is not divisible by 3" },
    { input: "11", expected: true, note: "3 is divisible by 3" },
    { input: "100", expected: false, note: "4 is not divisible by 3" },
    { input: "101", expected: false, note: "5 is not divisible by 3" },
    { input: "110", expected: true, note: "6 is divisible by 3" },
    { input: "111", expected: false, note: "7 is not divisible by 3" },
    { input: "1001", expected: true, note: "9 is divisible by 3" },
    { input: "1100", expected: true, note: "12 is divisible by 3" },
  ],
};

async function runSingleDfaTest(dfaId, testCase) {
  try {
    const response = await fetch("/run-dfa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dfa: dfaId,
        input_string: testCase.input,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[${dfaId}] ERROR for input "${testCase.input}"`, data);
      return;
    }

    const actual = Boolean(data.is_accepted);
    const passed = actual === testCase.expected;

    if (passed) {
      console.log(
        `PASS [${dfaId}] input="${testCase.input}" expected=${testCase.expected} actual=${actual}`
      );
    } else {
      console.error(
        `FAIL [${dfaId}] input="${testCase.input}" expected=${testCase.expected} actual=${actual}`,
        testCase.note ? `| ${testCase.note}` : ""
      );
    }
  } catch (error) {
    console.error(`[${dfaId}] FETCH FAILED for input "${testCase.input}"`, error);
  }
}

async function runAllDfaTests() {
  console.group("DFA Test Run");

  for (const [dfaId, tests] of Object.entries(dfaTests)) {
    console.group(dfaId);

    for (const testCase of tests) {
      await runSingleDfaTest(dfaId, testCase);
    }

    console.groupEnd();
  }

  console.groupEnd();
}

// Run it
runAllDfaTests();