<script>
  import { afterUpdate } from "svelte";

  let habits = [
    {
      id: 1,
      name: "Wakeup early at 6 A.M",
      complete: false,
    },
    {
      id: 2,
      name: "Workout",
      complete: false,
    },
  ];
  const existingData = localStorage.getItem("habits");
  const date = new Date();
  const dateNow = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("-");
  const lastUpdate =
    localStorage.getItem("lastUpdate") ||
    localStorage.setItem("lastUpdate", dateNow);
  if (existingData) {
    habits = JSON.parse(existingData);
  }
  let selectedMonth = date.getMonth() + 1;
  let dayOfTheMonth = new Date(date.getFullYear(), selectedMonth, 0).getDate();

  const setRandomStats = (days) => {
    const stats = [];
    for (let index = 0; index < days.length; index++) {
      stats.push(Math.floor(Math.random() * 100));
    }
    return stats;
  };
  let habitStats = setRandomStats(Array(dayOfTheMonth));

  const changeMonth = () => {
    dayOfTheMonth = new Date(date.getFullYear(), selectedMonth, 0).getDate();
    habitStats = setRandomStats(Array(dayOfTheMonth));
  };

  const saveHabits = (newHabits) => {
    habits = newHabits;
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("lastUpdate", dateNow);
  };

  if (lastUpdate !== dateNow) {
    for (let index = 0; index < habits.length; index++) {
      habits[index].complete = false;
    }
    saveHabits(habits);
  }

  const addHabit = (event) => {
    const { currentTarget } = event;
    const { innerText } = currentTarget;
    if (event.key === "Enter") {
      habits.push({
        id: new Date().getTime(),
        name: `${innerText}`.replace(/\n/g, ""),
        complete: false,
      });
      event.currentTarget.innerText = "";
      saveHabits(habits);
    }
  };

  const editHabit = (event) => {
    const { currentTarget } = event;
    const { innerText } = currentTarget;
    const { id } = currentTarget.dataset;
    for (let index = 0; index < habits.length; index++) {
      const habit = habits[index];
      if (habit.id !== parseInt(id)) {
        continue;
      }
      habits[index].name = innerText.replace(/\n\r/gm, "");
      break;
    }
    saveHabits(habits);
  };

  const deleteOnBlur = (event) => {
    const { currentTarget } = event;
    const { innerText } = currentTarget;
    const { id } = currentTarget.dataset;
    if (innerText === "") {
      saveHabits(habits.filter((val) => val.id !== parseInt(id)));
    }
  };

  afterUpdate(() => {
    if (habits) {
      for (let index = 0; index < habits.length; index++) {
        const habit = habits[index];
        const element = document.getElementById(`habit-label-${habit.id}`);
        if (habit.name !== element.innerText) {
          element.innerText = habit.name;
        }
      }
    }
  });

  const completeHabit = (event) => {
    const { currentTarget } = event;
    const { id } = currentTarget.dataset;
    for (let index = 0; index < habits.length; index++) {
      const habit = habits[index];
      if (habit.id !== parseInt(id)) {
        continue;
      }
      habits[index].complete = false;
      if (currentTarget.checked) {
        habits[index].complete = true;
      }
      break;
    }
    saveHabits(habits);
  };

  const preventEnter = (event) => {
    const { key } = event;
    if (key === "Enter") {
      event.preventDefault();
      return false;
    }
  };
</script>

<main class="text-white container mx-auto p-8">
  <h1 class="text-4xl font-bold mb-8">The Habit Tracker</h1>

  {#each habits as habit}
    <div class="mb-2 flex items-start gap-x-2">
      <input
        class="w-5 h-5 rounded cursor-pointer mr-1 mt-1"
        type="checkbox"
        name="habit-{habit.id}"
        id="habit-{habit.id}"
        checked={habit.complete}
        data-id={habit.id}
        on:click={completeHabit}
      />
      <span
        id="habit-label-{habit.id}"
        data-id={habit.id}
        on:keypress={preventEnter}
        on:keyup={editHabit}
        on:blur={deleteOnBlur}
        class="block w-full overflow-hidden textarea-resize min-h-fit text-lg resize-none focus:outline-none"
        role="textbox"
        contenteditable>{habit.name}</span
      >
    </div>
  {/each}

  <div>
    <span
      on:keyup={addHabit}
      on:keypress={preventEnter}
      class="block w-full overflow-hidden textarea-resize min-h-fit text-lg resize-none outline-none placeholder-habit cursor-text"
      role="textbox"
      contenteditable
    />
  </div>

  <div class="mt-8">
    <select
      name="year"
      class="mb-5 font-bold text-2xl pr-2 rounded bg-transparent focus:outline-none"
      id="report-year"
      bind:value={selectedMonth}
      on:change={changeMonth}
    >
      {#each Array(12) as _, month}
        <option class="text-black" value={month + 1}
          >{new Date(date.getFullYear(), month + 1, 0).toLocaleString("en", {
            month: "long",
          })}</option
        >
      {/each}
    </select>
    <div class="overflow-x-auto mb-5">
      <div class="flex items-end mb-3" style="height: 120px;">
        {#each habitStats as stat, index}
          <button
            type="button"
            class="text-center mr-3 relative cursor-pointer hover:opacity-80"
          >
            <div class="w-10 bg-amber-500" style="height: {stat}px;" />
            <div class="font-bold bg-amber-700 font-mono">{index + 1}</div>
          </button>
        {/each}
      </div>
    </div>
    <div
      class="bg-black w-full md:w-80 py-2 px-4 rounded text-left bg-opacity-80"
    >
      Wakeup early at 6 A.M<br />
      Workout
    </div>
  </div>
</main>

<style>
  .placeholder-habit[contenteditable]:empty::before {
    content: "Add a habit";
    color: #9ca3af;
  }
</style>
