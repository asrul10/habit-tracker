<script>
  import grabIcon from "../assets/grab.svg";
  import checkIcon from "../assets/check.svg";
  import { preventEnter } from "../utils/preventEnterKey";
  import { afterUpdate } from "svelte";
  import Tracker from "./Tracker.svelte";

  export let index = 0;
  export let habit = { id: 0, name: "" };
  export let isComplete = false;
  export let onDrag = false;
  export let disableEdit = false;
  export let history = [];
  export let onDragstart = () => {};
  export let onDragend = () => {};
  export let onDragover = () => {};
  export let onTouchStart = () => {};
  export let onTouchMove = () => {};
  export let onTouchEnd = () => {};
  export let saveHabit = (habit) => {};
  export let saveHistory = (habit, isComplete) => {};
  export let deletHabit = (habitId) => {};

  let inputEle = null;
  let focus = false;

  const toggleFocus = () => {
    focus = !focus;
  };

  const editHabit = (event) => {
    const { currentTarget } = event;
    const { value } = currentTarget;
    habit.name = value;
    habit = habit;
    saveHabit(habit);
  };

  const deleteHabit = (event) => {
    const { currentTarget } = event;
    const { value } = currentTarget;
    if (value === "") {
      deletHabit(habit.id);
    }
  };

  const completeHabit = (event) => {
    isComplete = !isComplete;
    saveHistory(habit, isComplete);
  };

  afterUpdate(() => {
    inputEle.style.height = "auto";
    inputEle.style.height = inputEle.scrollHeight + 10 + "px";
  });
</script>

<div
  id={`parent-${habit.id}`}
  data-index={index}
  data-target={habit.id}
  class:bg-opacity-40={isComplete || onDrag}
  on:dragover={onDragover}
  class={`${
    onDrag || focus ? "border-lime-400" : "border-transparent"
  } mb-5 border-2 bg-zinc-600 rounded-lg p-3`}
>
  <div class="flex items-start">
    <div
      class="cursor-grab touch-none w-7 h-7 justify-center flex items-center mr-2 shrink-0 grow-0"
      id={`dragger-${habit.id}`}
      data-index={index}
      data-target={habit.id}
      draggable="true"
      on:dragstart={onDragstart}
      on:dragend={onDragend}
      on:touchstart={onTouchStart}
      on:touchmove={onTouchMove}
      on:touchend={onTouchEnd}
    >
      <img src={grabIcon} class="w-6 h-6 opacity-30" alt="grab icon" />
    </div>
    <div
      class="cursor-grab touch-none w-7 h-7 z-50 items-center mr-2 shrink-0 grow-0 hidden"
      id={`mobile-drag-${habit.id}`}
    >
      <img src={grabIcon} class="w-6 h-6 opacity-30" alt="grab icon" />
    </div>
    <textarea
      on:keypress={preventEnter}
      on:input={editHabit}
      on:change={deleteHabit}
      on:focus={toggleFocus}
      on:focusout={toggleFocus}
      bind:this={inputEle}
      id="habit-label-{habit.id}"
      data-id={habit.id}
      rows="1"
      disabled={disableEdit}
      class:opacity-50={isComplete}
      class="block box-border p-0 overflow-hidden w-full bg-transparent resize-none text-xl focus:outline-none"
      value={habit.name}
    />
    <div class="w-7 h-7 flex items-center justify-center ml-2 shrink-0 grow-0">
      <div
        class:bg-white={!isComplete}
        class:bg-lime-500={isComplete}
        class="w-6 h-6 rounded p-1 cursor-pointer"
        data-target={habit.id}
        on:click={completeHabit}
      >
        <img src={checkIcon} alt="check icon" />
      </div>
    </div>
  </div>
  <Tracker {history} />
</div>
