<script lang="ts" setup>
import {nextTick, onMounted, onUnmounted, ref} from 'vue';
import {
  getAnswerLine,
  getRandomAuthor,
  getRandomQuestionByAuthor,
  getRandomQuestionByWork,
  getRandomWork,
  loadMainDatabase
} from "../functions/database-methods.ts";

const displayText = ref('')
const db = ref();
const showAnswerBox = ref(false);
const answerBox = ref("");
const authorsQuestionsEnabled = ref(true)
const worksQuestionsEnabled = ref(true)
const answerBoxThing = ref(HTMLInputElement)
const clock = ref(0.0);
const score = ref(0);
const visibleAnswerLine = ref("")
let showAnswerLine = false;
let isTakingAnswer = false;
let isReading = false;
let answerLine = "Jabberwocky"
let removeEnterKeyHandler: Function;
let paused = false;
let resumeCallback: (() => void) | null = null;
let currentRunNumber = 0;

onMounted(async () => {
  db.value = await loadMainDatabase()
  window.addEventListener("keydown", keyControl)
})

onUnmounted(async () => {
  window.removeEventListener("keydown", keyControl)
  stop()
})

async function startTimer(time: number) {
  clock.value = time;
  while (clock.value > 0 && isTakingAnswer) {
    await delay(100);
    clock.value = +(clock.value - 0.1).toFixed(1)
  }
  clock.value = 0;
}

function keyControl(event: KeyboardEvent): void {
  if (isTakingAnswer) {
    return
  }
  switch (event.key) {
    case "n":
    case "s":
      start()
      break;
    case " ":
      buzz(5, true)
      break;
    case "p":
      if (!paused) {
        pause()
      } else {
        resume()
      }
      break;
  }
}

/**
 * Reads out a question until interrupted
 * @param easyText the text of the easy clue
 * @param mediumText the text of the medium clue
 * @param hardText the text of the hard clue
 * @param delayBetweenWords the delay between reading words
 * @param delayBetweenQuestions the delay between reading entire clues / sentences
 * @param runNumber the ID of the current question run
 */
async function readTextUntilInterrupted(easyText: string, mediumText: string, hardText: string, delayBetweenWords: number, delayBetweenQuestions: number, runNumber: number): Promise<void> {
  console.log("Started Reading Run " + runNumber + ", current run number is " + currentRunNumber);
  isReading = true;
  showAnswerLine = false;
  let easyWords: string[] = easyText.split(' ').reverse()
  let mediumWords: string[] = mediumText.split(' ').reverse()
  let hardWords: string[] = hardText.split(' ').reverse()
  await readLine(easyWords, delayBetweenWords, delayBetweenQuestions, false, runNumber)
  await readLine(mediumWords, delayBetweenWords, delayBetweenQuestions, false, runNumber)
  await readLine(hardWords, delayBetweenWords, delayBetweenQuestions, true, runNumber)
  await buzz(10, false);
  showAnswerLine = true;
  console.log("Finished Reading Run " + runNumber + ", current run number is " + currentRunNumber);
  if (runNumber === currentRunNumber) {
    isReading = false;
  }
}

/**
 * Reads out a single clue worth of text slowly until interrupted
 * @param line the line to be read
 * @param wordDelayTime the delay between words in ms
 * @param lineDelayTime the time to wait before returning the function in ms
 * @param isLast determines whether it delays at the end of the line
 * @param runNumber the ID of the current question read
 */
async function readLine(line: string[], wordDelayTime: number, lineDelayTime: number, isLast: boolean, runNumber: number): Promise<void> {
  while (line.length > 0 && runNumber === currentRunNumber) {
    await addNextWord(line.pop() as string, wordDelayTime, runNumber)
  }
  if (runNumber !== currentRunNumber) return;
  displayText.value += ". "
  if (!isLast) await delay(lineDelayTime)
}

/**
 * Reads out a single word with a delay
 * @param word word to be read
 * @param delayTime the delay in ms
 * @param runNumber the ID of the current question run
 */
async function addNextWord(word: string, delayTime: number, runNumber: number): Promise<void> {
  if (word != undefined) {
    if (runNumber !== currentRunNumber) return;
    await delay(delayTime)
    if (runNumber !== currentRunNumber) return;
    await awaitUnpaused()
    if (runNumber !== currentRunNumber) return;
    displayText.value += " " + word
  }
}

/**
 * Pauses the current text operation
 */
function pause() {
  paused = true;
}

/**
 * Resumes the current text operation
 */
function resume() {
  paused = false;
  resumeCallback?.()
}

/**
 * Stops the current text operation
 */
function stop() {
  currentRunNumber++
  isReading = false;
  resumeCallback?.()
}

/**
 * Interrupts the current text operation and asks for an answer
 */
async function buzz(answerTime: number, hasPenalty: boolean): Promise<void> {
  if (!isReading) {
    console.log("Cannot buzz when a question is not being read!")
    return;
  }

  pause()
  isTakingAnswer = true
  showAnswerBox.value = true
  await nextTick(() => {
    answerBoxThing.value!.focus()
  })
  //await startTimer()
  await handleAnswer(answerTime, hasPenalty)
}

/**
 * Waits for the enter key to be pressed then returns
 */
async function waitForEnterKey() {
  return new Promise(resolve => {
    function keyHandler(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        resolve("enter");
      }
    }

    removeEnterKeyHandler = () => {
      window.removeEventListener('keydown', keyHandler);
    }

    window.addEventListener('keydown', keyHandler);
  })
}

/**
 * Sets a 5 second timer, if the answer
 * put in the box is correct after that 5 seconds or enter is pressed, stops
 * the question / keeps going if its wrong
 */
async function handleAnswer(answerTime: number, hasPenalty: boolean): Promise<void> {
  console.log("HANDLING ANSWER")
  await Promise.race([startTimer(answerTime), waitForEnterKey()])
  removeEnterKeyHandler();
  showAnswerBox.value = false
  if (sanitizeInput(answerBox.value) === answerLine) {
    console.log("Correct answer")
    score.value += 10;
    console.log("answerLine: " + answerLine);
    console.log("answerBox.value: " + sanitizeInput(answerBox.value));
    answerLine = ""
    resume()
    stop()
  } else {
    console.log("Incorrect answer")
    if (score.value > 0 && hasPenalty) score.value -= 5
    console.log("answerLine: " + answerLine);
    console.log("answerBox.value: " + sanitizeInput(answerBox.value));
    resume()
  }
  answerBox.value = "";
  isTakingAnswer = false
}

/**
 * Waits for the text operation to be unpaused before returning
 */
async function awaitUnpaused(): Promise<void> {
  while (paused) {
    await new Promise<void>(resolve => resumeCallback = resolve)
  }
}

/**
 * Waits a specified time before returning
 * @param ms the time to wait in ms
 */
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reads a random question made up of a hard, medium and easy part for a work or
 * author and waits for a valid answer
 */
async function start(): Promise<void> {
  currentRunNumber++
  displayText.value = "";
  const runNumber = currentRunNumber;
  await Promise.resolve()
  let easyRow;
  let mediumRow;
  let hardRow;
  let questionType; // 0 is authors question, 1 is works question
  if (authorsQuestionsEnabled.value && worksQuestionsEnabled.value) {
    questionType = Math.floor(Math.random() * 2) // 0 or 1
  } else {
    questionType = (authorsQuestionsEnabled.value) ? 0 : 1
  }
  console.log("Question type: " + questionType);
  const authorWorkID = (questionType === 0) ? await getRandomAuthor(db.value) : await getRandomWork(db.value) // Can be an author or work
  answerLine = (questionType === 0) ? await getAnswerLine(db.value, authorWorkID, "authors") : await getAnswerLine(db.value, authorWorkID, "works")
  if (questionType === 0) {
    easyRow = await getRandomQuestionByAuthor(db.value, authorWorkID, "Easy")
    mediumRow = await getRandomQuestionByAuthor(db.value, authorWorkID, "Medium")
    hardRow = await getRandomQuestionByAuthor(db.value, authorWorkID, "Hard")
  } else {
    easyRow = await getRandomQuestionByWork(db.value, authorWorkID, "Easy")
    mediumRow = await getRandomQuestionByWork(db.value, authorWorkID, "Medium")
    hardRow = await getRandomQuestionByWork(db.value, authorWorkID, "Hard")
  }
  await readTextUntilInterrupted(easyRow.content, mediumRow.content, hardRow.content, 500, 2000, runNumber)
}

function sanitizeInput(input: string): string {
  const newString: string = input.replaceAll(" ", "").toLowerCase();
  return newString;
}

</script>

<template>
  <main>
    <div class="scorebar">
      <p>Score: {{ score }}</p>
    </div>
    <div class="playArea">
      <div class="main">
        <button @click="start">start</button>
        <button @click="resume">resume</button>
        <button @click="pause">pause</button>
        <button @click="stop">stop</button>
        <button class="rightButtons" @click="buzz">buzz</button>
        <p> {{ answerBox }}</p>
        <p> {{ displayText }}</p>
        <input v-if="showAnswerBox" ref="answerBoxThing" v-model="answerBox"><br>
        <p v-if="showAnswerLine"> {{ visibleAnswerLine }}</p>

      </div>
      <div class="sideBar">
        <p class="timer"> {{ clock }}</p>
      </div>
    </div>

  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
}

.main {
  width: 90%;
  padding: 2rem;
}

.playArea {
  display: flex;
  flex-direction: row;
}

.sideBar {
  width: 10%;
}

.timer {
  text-align: center;
  font-size: 2rem;
  background: lightgray;
  padding: 1rem;
}

.scorebar {
  background-color: lightgray;
  padding-left: 1rem;
}


</style>