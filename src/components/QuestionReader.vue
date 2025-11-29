<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {getRandomAuthor, getRandomQuestionByAuthor, loadMainDatabase} from "../functions/database-methods.ts";

const displayText = ref('')
const db = ref();
let paused = false;
let resumeCallback: (() => void) | null = null;
let currentRunNumber = 0;

onMounted(async () => {
  db.value = await loadMainDatabase()
})

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
  let easyWords: string[] = easyText.split(' ').reverse()
  let mediumWords: string[] = mediumText.split(' ').reverse()
  let hardWords: string[] = hardText.split(' ').reverse()
  await readLine(easyWords, delayBetweenWords, delayBetweenQuestions, false, runNumber)
  await readLine(mediumWords, delayBetweenWords, delayBetweenQuestions, false, runNumber)
  await readLine(hardWords, delayBetweenWords, delayBetweenQuestions, true, runNumber)
  console.log("FINISHED READING")
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
  resumeCallback?.()
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

async function start(): Promise<void> {
  currentRunNumber++
  displayText.value = "";
  const runNumber = currentRunNumber;
  await Promise.resolve()
  displayText.value += ""
  const authorID = await getRandomAuthor(db.value)
  const easyRow = await getRandomQuestionByAuthor(db.value, authorID, "Easy")
  const mediumRow = await getRandomQuestionByAuthor(db.value, authorID, "Medium")
  const hardRow = await getRandomQuestionByAuthor(db.value, authorID, "Hard")
  await readTextUntilInterrupted(easyRow.content, mediumRow.content, hardRow.content, 500, 2000, runNumber)
}

</script>

<template>
  <button @click="start">start</button>
  <p> {{ displayText }}</p>
  <button @click="resume">resume</button>
  <button @click="pause">pause</button>
  <button @click="stop">stop</button>
</template>

<style scoped>

</style>