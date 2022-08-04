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
  const addHabit = () => {
    habits.push({
      id: new Date().getTime(),
      name: newHabit,
      complete: false,
    });
    habits = habits;
    newHabit = "";
  };
</script>

<main class="text-white container mx-auto p-8">
  <h1 class="text-4xl font-bold mb-8">The Habit Tracker</h1>

  {#each habits as habit}
    <div class="mb-2">
      <label for="habit-{habit.id}" class="cursor-pointer flex items-center">
        <input
          class="w-4 h-4 rounded cursor-pointer mr-2"
          type="checkbox"
          name="habit-{habit.id}"
          id="habit-{habit.id}"
        />
        {habit.name}
      </label>
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
