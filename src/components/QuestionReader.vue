<script lang="ts" setup>
import {onMounted, ref} from 'vue';

const displayText = ref('')
let exited = ref(false);
let paused = false;
let resumeCallback: (() => void) | null = null;

/**
 * Reads out a question until interrupted
 * @param easyText the text of the easy clue
 * @param mediumText the text of the medium clue
 * @param hardText the text of the hard clue
 * @param delayBetweenWords the delay between reading words
 * @param delayBetweenQuestions the delay between reading entire clues / sentences
 */
async function readTextUntilInterrupted(easyText: string, mediumText: string, hardText: string, delayBetweenWords: number, delayBetweenQuestions: number): Promise<void> {
  let easyWords: string[] = easyText.split(' ').reverse()
  let mediumWords: string[] = mediumText.split(' ').reverse()
  let hardWords: string[] = hardText.split(' ').reverse()
  exited.value = false;
  await readLine(easyWords, delayBetweenWords, delayBetweenQuestions, false)
  await readLine(mediumWords, delayBetweenWords, delayBetweenQuestions, false)
  await readLine(hardWords, delayBetweenWords, delayBetweenQuestions, true)
  console.log("FINISHED READING")
}

/**
 * Reads out a single clue worth of text slowly until interrupted
 * @param line the line to be read
 * @param wordDelayTime the delay between words in ms
 * @param lineDelayTime the time to wait before returning the function in ms
 * @param isLast determines whether it delays at the end of the line
 */
async function readLine(line: string[], wordDelayTime: number, lineDelayTime: number, isLast: boolean): Promise<void> {
  while (line.length > 0) {
    await addNextWord(line.pop() as string, wordDelayTime)
  }
  if (exited.value) return;
  displayText.value += ". "
  if (!isLast) await delay(lineDelayTime)
}

/**
 * Reads out a single word with a delay
 * @param word word to be read
 * @param delayTime the delay in ms
 */
async function addNextWord(word: string, delayTime: number): Promise<void> {
  if (word != undefined) {
    if (exited.value) return;
    await delay(delayTime)
    await awaitUnpaused()
    if (exited.value) return;
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
  exited.value = true;
  resume();
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

onMounted(() => {
  readTextUntilInterrupted("Easy part of the question", "Medium part of the question", "Hard Part of the question", 500, 2000)
})
</script>

<template>
  <p> {{ displayText }}</p>
  <button @click="resume">resume</button>
  <button @click="pause">pause</button>
  <button @click="stop">stop</button>
</template>

<style scoped>

</style>