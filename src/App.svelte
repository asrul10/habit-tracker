<script>
  import HabitList from "./lib/HabitList.svelte";
  import seedingIcon from "./assets/seedling.png";
</script>

<main class="text-white max-w-2xl px-4 mx-auto pt-8 pb-16">
  <div class="flex items-center gap-2 mb-10">
    <div>
      <img src={seedingIcon} alt="habit" class="w-9 h-9" />
    </div>
    <h1 class="text-4xl font-bold">
      <span class="text-lime-400">Habit</span> Tracker
    </h1>
  </div>

  <HabitList />
</main>
