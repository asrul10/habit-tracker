<script>
  let newHabit = "";
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

  const addHabit = () => {
    habits.push({
      id: new Date().getTime(),
      name: newHabit,
      complete: false,
    });
    newHabit = "";
    saveHabits(habits);
  };

  const removeHabit = (event) => {
    const { currentTarget } = event;
    const { id } = currentTarget.dataset;
    for (let index = 0; index < habits.length; index++) {
      const habit = habits[index];
      if (habit.id !== parseInt(id)) {
        continue;
      }
      habits.splice(index, 1);
      break;
    }
    saveHabits(habits);
  };

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
</script>

<main class="text-white container mx-auto p-8">
  <h1 class="text-4xl font-bold mb-8">The Habit Tracker</h1>

  {#each habits as habit}
    <div class="mb-2 flex items-center gap-x-2">
      <input
        class="w-4 h-4 rounded cursor-pointer mr-2"
        type="checkbox"
        name="habit-{habit.id}"
        id="habit-{habit.id}"
        checked={habit.complete}
        data-id={habit.id}
        on:click={completeHabit}
      />
      <label for="habit-{habit.id}" class="cursor-pointer ">
        {habit.name}
      </label>
      <button
        on:click={removeHabit}
        data-id={habit.id}
        class="bg-red-500 rounded-full text-sm px-2 font-bold opacity-80 h-4 flex items-center"
      >
        <span class="offsetTop"> &#8211; </span>
      </button>
    </div>
  {/each}

  <div class="mt-5">
    <input
      class="p-2 rounded-tl rounded-bl w-77 outline-none text-black"
      type="text"
      name="addHabit"
      id="addHabit"
      placeholder="Add a habit"
      bind:value={newHabit}
    />
    <button
      class="bg-amber-500 py-2 px-3 rounded-tr rounded-br"
      on:click={addHabit}>Add</button
    >
  </div>
</main>

<style>
  .offsetTop {
    margin-top: -5px;
  }
</style>
