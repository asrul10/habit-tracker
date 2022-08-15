<script>
  import { afterUpdate, onMount } from "svelte";

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

  const changeMonth = (event) => {
    const { currentTarget } = event;
    const { month } = currentTarget.dataset;

    selectedMonth = month + 1;
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
    const { target } = currentTarget.dataset;
    for (let index = 0; index < habits.length; index++) {
      const habit = habits[index];
      if (habit.id !== parseInt(target)) {
        continue;
      }
      habits[index].complete = !habits[index].complete;
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

  onMount(() => {
    document.getElementById("months").scrollTo(143 * 6, 0);
  });
</script>

<main class="text-white sm:w-96 mx-auto py-10">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-8">Habits Tracker</h1>
  </div>

  {#each habits as habit}
    <div class="mb-2 flex items-start gap-x-2">
      <span
        class="w-5 h-5 rounded mt-1 p-1 mr-1 cursor-pointer {habit.complete
          ? `bg-blue-500`
          : `bg-white`}"
        data-target={habit.id}
        on:click={completeHabit}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            fill="#fff"
            d="M438.6 105.4C451.1 117.9 451.1 138.1 438.6 150.6L182.6 406.6C170.1 419.1 149.9 419.1 137.4 406.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4C21.87 220.9 42.13 220.9 54.63 233.4L159.1 338.7L393.4 105.4C405.9 92.88 426.1 92.88 438.6 105.4H438.6z"
          /></svg
        >
      </span>
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

  <div class="mb-2 flex items-start gap-x-2">
    <span class="w-5 h-5 mr-1" />
    <span
      on:keyup={addHabit}
      on:keypress={preventEnter}
      class="block w-full overflow-hidden textarea-resize min-h-fit text-lg resize-none outline-none placeholder-habit cursor-text"
      role="textbox"
      contenteditable
    />
  </div>

  <div class="mt-8">
    <div class="w-full py-3 overflow-x-auto overflow-y-hidden mb-4" id="months">
      {#each Array(12) as _, month}
        <span
          data-month={month}
          on:click={changeMonth}
          class="py-1 px-4 rounded-full mr-2 cursor-pointer whitespace-nowrap {selectedMonth -
            1 ===
          month
            ? `bg-amber-500`
            : `bg-gray-500`}"
        >
          {new Date(date.getFullYear(), month + 1, 0).toLocaleString("en", {
            month: "long",
          })} 2022
        </span>
      {/each}
    </div>
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
    <div class="bg-black w-full py-2 px-4 rounded text-left bg-opacity-50">
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
