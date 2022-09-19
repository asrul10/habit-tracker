<script>
  import { dateFormatter } from "../utils/dateFormatter";
  import { preventEnter } from "../utils/preventEnterKey";
  import Habit from "./Habit.svelte";

  if (!localStorage.getItem("habits")) {
    localStorage.setItem(
      "habits",
      JSON.stringify([
        {
          id: 1,
          name: "Reading a book",
        },
        {
          id: 2,
          name: "Workout",
        },
        {
          id: 3,
          name: "Writing",
        },
      ])
    );
  }

  const dateNow = dateFormatter(new Date());

  let habits = JSON.parse(localStorage.getItem("habits"));
  let habitHistories = JSON.parse(localStorage.getItem("habitHistories")) || [];
  let dragCurrentId = null;
  let disableEdit = false;
  let focus = false;
  let uncompleteOnly = false;
  let fileImport = null;
  let toast = null;

  $: todayCompleted = isCompletedToday(habitHistories);

  const isCompletedToday = (histories) => {
    return histories
      .filter((val) => val.completedAt === dateNow)
      .map((val) => val.id);
  };

  const getCurrentPosition = (positionY) => {
    const listPosition = [];
    for (let index = 0; index < habits.length; index++) {
      const { id, name } = habits[index];
      const ele = document.getElementById(`parent-${id}`);
      ele.style.marginTop = null;
      listPosition.push({
        id,
        name,
        ele,
        index: ele.dataset.index,
        minY: ele.offsetTop,
        maxY: ele.offsetTop + ele.offsetHeight + 8,
      });
    }

    const currentPosition = listPosition.find(
      (val) => val.minY <= positionY && val.maxY > positionY
    );

    if (!currentPosition) {
      return null;
    }
    return currentPosition;
  };

  const toggleFocus = () => {
    focus = !focus;
  };

  const onDragstart = (event) => {
    const { currentTarget } = event;
    const { target } = currentTarget.dataset;
    disableEdit = true;
    dragCurrentId = parseInt(target);
  };

  const onDragover = (event) => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const newIndex = parseInt(index);
    const oldIndex = habits.findIndex((val) => val.id === dragCurrentId);
    habits.splice(newIndex, 0, habits.splice(oldIndex, 1)[0]);
    habits = habits;
    localStorage.setItem("habits", JSON.stringify(habits));
  };

  const onDragend = () => {
    dragCurrentId = null;
    disableEdit = false;
  };

  const onTouchStart = (event) => {
    const { currentTarget } = event;
    const { target } = currentTarget.dataset;

    dragCurrentId = parseInt(target);
  };

  const onTouchMove = (event) => {
    const { currentTarget } = event;
    const { target } = currentTarget.dataset;

    let touchLocation = event.targetTouches[0];
    let pageX = Math.floor(touchLocation.pageX);
    let pageY = Math.floor(touchLocation.pageY);

    const dragEle = document.getElementById(`mobile-drag-${target}`);
    dragEle.classList.remove("hidden");
    dragEle.style.position = "absolute";
    dragEle.style.left = pageX - 11 + "px";
    dragEle.style.top = pageY - 11 + "px";

    const currentPosition = getCurrentPosition(pageY);
    if (!currentPosition) {
      return;
    }
    const newIndex = parseInt(currentPosition.index);
    const oldIndex = habits.findIndex((val) => val.id === dragCurrentId);
    habits.splice(newIndex, 0, habits.splice(oldIndex, 1)[0]);
    habits = habits;
    localStorage.setItem("habits", JSON.stringify(habits));
  };

  const onTouchEnd = (event) => {
    const { currentTarget } = event;
    const { target } = currentTarget.dataset;

    if (dragCurrentId) {
      const dragEle = document.getElementById(`mobile-drag-${target}`);
      dragEle.classList.add("hidden");
      dragEle.style.position = null;
      dragEle.style.left = null;
      dragEle.style.top = null;
      console.log(dragEle);
      dragCurrentId = null;
    }
  };

  const addHabit = (event) => {
    const { currentTarget } = event;
    const { value } = currentTarget;

    if (event.key === "Enter") {
      saveHabit({
        id: new Date().getTime(),
        name: value,
      });
      event.currentTarget.value = "";
      autoResize(event);
    }
  };

  const autoResize = (event) => {
    const { currentTarget } = event;
    currentTarget.style.height = "auto";
    currentTarget.style.height = currentTarget.scrollHeight + "px";
  };

  const deletHabit = (habitId) => {
    const getIndex = habits.findIndex((val) => val.id === habitId);
    habits.splice(getIndex, 1);
    habits = habits;
    localStorage.setItem("habits", JSON.stringify(habits));
  };

  const saveHabit = (newHabit) => {
    const getIndex = habits.findIndex((val) => val.id === newHabit.id);
    habits[getIndex === -1 ? habits.length : getIndex] = newHabit;
    habits = habits;
    localStorage.setItem("habits", JSON.stringify(habits));
  };

  const saveHistory = (newHabit, isComplete) => {
    const getIndex = habitHistories.findIndex(
      (val) => val.id === newHabit.id && val.completedAt === dateNow
    );
    if (!isComplete && getIndex !== -1) {
      habitHistories.splice(getIndex, 1);
    } else {
      habitHistories.push({ ...newHabit, completedAt: dateNow });
    }
    habitHistories = habitHistories;
    localStorage.setItem("habitHistories", JSON.stringify(habitHistories));
  };

  const resetData = () => {
    if (!confirm("This will reset all your data!")) {
      return;
    }
    habits = [
      {
        id: 1,
        name: "Reading a book",
      },
      {
        id: 2,
        name: "Workout",
      },
      {
        id: 3,
        name: "Writing",
      },
    ];
    habitHistories = [];
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("habitHistories", JSON.stringify(habitHistories));
    showToast("Data reseted!");
  };

  const toggleList = () => {
    uncompleteOnly = !uncompleteOnly;
  };

  const exportData = () => {
    const data = { habits, habitHistories };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "habit.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event) => {
    const fileList = event.target.files;
    if (!fileList[0]) {
      showToast("File not found!");
      return;
    }
    if (fileList[0].type !== "application/json") {
      showToast("Invalid file!");
      return;
    }
    var readFile = new FileReader();
    readFile.readAsText(fileList[0]);
    readFile.onloadend = function (e) {
      if (typeof e.target.result !== "string") {
        return;
      }
      const json = JSON.parse(e.target.result);
      console.log(json);
      habits = json.habits;
      habitHistories = json.habitHistories;
      localStorage.setItem("habits", JSON.stringify(habits));
      localStorage.setItem("habitHistories", JSON.stringify(habitHistories));
      fileImport.value = "";
      showToast("Data imported!");
    };
  };

  const showToast = (text) => {
    toast.innerText = text;
    toast.style.bottom = "15px";
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.innerText = "";
      toast.style.bottom = null;
      toast.classList.add("hidden");
    }, 3000);
  };
</script>

<div>
  <div class="flex gap-3 mb-4">
    <div
      on:click={toggleList}
      class={`w-10 h-6 bg-white flex p-[0.1rem] rounded-full cursor-pointer ${
        uncompleteOnly ? "justify-end bg-lime-500" : "bg-zinc-500"
      }`}
    >
      <span class="w-5 rounded-full bg-white" />
    </div>
    Show incomplete only
  </div>
  {#each habits as habit, index}
    {#if todayCompleted.includes(habit.id) !== (uncompleteOnly || null)}
      <Habit
        {index}
        {habit}
        isComplete={todayCompleted.includes(habit.id)}
        onDrag={dragCurrentId === habit.id}
        {disableEdit}
        {onDragstart}
        {onDragend}
        {onDragover}
        {onTouchStart}
        {onTouchMove}
        {onTouchEnd}
        {saveHabit}
        {saveHistory}
        {deletHabit}
        history={habitHistories.filter((val) => val.id === habit.id)}
      />
    {/if}
  {/each}
  <div
    class={`${
      focus ? "border-lime-400" : "border-transparent"
    } mb-5 flex border-2 items-start bg-zinc-600 rounded-md p-3 gap-x-2`}
  >
    <textarea
      on:input={autoResize}
      on:keyup={addHabit}
      on:keypress={preventEnter}
      on:focus={toggleFocus}
      on:blur={toggleFocus}
      placeholder="Add new habit"
      rows="1"
      class="block box-border overflow-hidden w-full bg-transparent resize-none text-lg focus:outline-none px-3"
      disabled={disableEdit}
    />
  </div>
  <div class="flex gap-3">
    <button
      on:click={exportData}
      type="button"
      class="w-full rounded-md bg-zinc-300 mb-5 text-black hover:opacity-100 opacity-70 font-bold p-2"
    >
      Export Data
    </button>
    <button
      on:click={() => fileImport.click()}
      type="button"
      class="w-full rounded-md bg-zinc-300 mb-5 text-black hover:opacity-100 opacity-70 font-bold p-2"
    >
      Import Data
    </button>
  </div>
  <input
    class="hidden"
    type="file"
    bind:this={fileImport}
    on:change={importData}
    accept=".json,application/json"
  />
  <button
    on:click={resetData}
    type="button"
    class="w-full rounded-md active:bg-red-500 active:text-white hover:opacity-100 border-2 border-red-500 text-red-500 opacity-80 font-bold p-2"
  >
    Reset Data
  </button>
  <div
    class="bg-lime-500 text-black rounded-md px-3 py-1 fixed hidden"
    bind:this={toast}
  />
</div>
