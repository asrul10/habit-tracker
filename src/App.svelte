<script>
  import { afterUpdate, onMount } from "svelte";

  if (!localStorage.getItem("habits")) {
    localStorage.setItem(
      "habits",
      JSON.stringify([
        {
          id: 1,
          name: "10 minute reading a book",
        },
        {
          id: 2,
          name: "10 minute workout",
        },
      ])
    );
  }
  let habits = JSON.parse(localStorage.getItem("habits"));
  let habitHistories = JSON.parse(localStorage.getItem("habitHistories")) || [];
  let habitHistoryByMonth = [];
  let habitStats = [];
  let selectedMonth = "";
  let habitDetail = [];
  let dragPosition = null;

  const formatDate = (date, yearMonth = false) => {
    let formatted = [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, "0"),
    ];
    if (!yearMonth) {
      formatted.push(date.getDate().toString().padStart(2, "0"));
    }
    return formatted.join("-");
  };

  const getStats = (date) => {
    const days = Array(
      new Date(date.getFullYear(), date.getMonth(), 0).getDate()
    );
    const stats = [];
    let hasData = false;
    for (let day = 1; day <= days.length; day++) {
      date.setDate(day);
      const reportDate = formatDate(date);
      const filtered = habitHistories.filter(
        (val) => val.completedAt === reportDate
      );

      if (date.getTime() > new Date().getTime()) {
        continue;
      }
      if (!hasData && !filtered.length) {
        continue;
      }
      hasData = true;

      stats.push({
        id: formatDate(date),
        date: date.getDate(),
        total: filtered.length,
        habits: filtered,
      });
    }
    return stats;
  };

  const historyByMonth = () => {
    let listByMonth = [];
    for (let index = 0; index < habitHistories.length; index++) {
      const habit = habitHistories[index];
      const yearAndMonth = habit.completedAt.replace(/-\d{2}$/, "");
      if (listByMonth.find((val) => val === yearAndMonth)) {
        continue;
      }
      listByMonth.push(yearAndMonth);
    }
    return listByMonth;
  };

  const dateNow = formatDate(new Date());
  habitHistoryByMonth = historyByMonth();
  habitStats = getStats(new Date());
  selectedMonth = formatDate(new Date(), true);

  const changeMonth = (event) => {
    const { currentTarget } = event;
    const { yearMonth } = currentTarget.dataset;
    const date = new Date(`${yearMonth}-01`);

    selectedMonth = yearMonth;
    habitStats = getStats(date);
  };

  const labelPills = (habitHistoryByMonth) => {
    const date = new Date(`${habitHistoryByMonth}-01`);
    const year = date.getFullYear();
    const month = date.toLocaleString("en", {
      month: "long",
    });
    return `${month} ${year}`;
  };

  const saveHabits = (newHabits) => {
    habits = newHabits;
    localStorage.setItem("habits", JSON.stringify(habits));
  };

  const saveCompletedHabits = (habit) => {
    let uncompleteIndex = null;
    for (let index = 0; index < habitHistories.length; index++) {
      const history = habitHistories[index];
      if (history.id === habit.id && history.completedAt === dateNow) {
        uncompleteIndex = index;
      }
    }
    if (uncompleteIndex !== null) {
      habitHistories.splice(uncompleteIndex, 1);
    } else {
      habitHistories.push({ ...habit, completedAt: dateNow });
    }
    habitHistories = habitHistories;
    habitHistoryByMonth = historyByMonth();
    habitStats = getStats(new Date());
    localStorage.setItem("habitHistories", JSON.stringify(habitHistories));
  };

  const addHabit = (event) => {
    const { currentTarget } = event;
    const { innerText } = currentTarget;
    if (event.key === "Enter") {
      habits.push({
        id: new Date().getTime(),
        name: `${innerText}`.replace(/\n/g, ""),
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
    const habit = habits.find((val) => val.id === parseInt(target));
    saveCompletedHabits(habit);
  };

  const preventEnter = (event) => {
    const { key } = event;
    if (key === "Enter") {
      event.preventDefault();
      return false;
    }
  };

  const onDragend = (event) => {
    const { currentTarget } = event;
    const { target } = currentTarget.dataset;

    let indexFrom = null;
    let indexTarget = null;
    let currHabit = null;
    for (let index = 0; index < habits.length; index++) {
      const habit = habits[index];
      if (habit.id === parseInt(target)) {
        indexFrom = index;
        currHabit = habit;
      }
      if (habit.id === parseInt(dragPosition)) {
        indexTarget = index;
      }
    }

    habits.splice(indexFrom, 1);
    habits.splice(indexTarget, 0, currHabit);

    habits = habits;
    dragPosition = null;
  };

  const onDragover = (event) => {
    const { currentTarget } = event;
    const { target } = currentTarget.dataset;
    dragPosition = target;
    currentTarget.classList.add("border-t-4", "border-amber-500");
  };

  const onDragleave = (event) => {
    const { currentTarget } = event;
    currentTarget.classList.remove("border-t-4", "border-amber-500");
  };

  onMount(() => {
    document.getElementById(`month-${selectedMonth}`)?.scrollIntoView();
    document.getElementById(`stat-${dateNow}`)?.scrollIntoView();
  });
</script>

<main class="text-white sm:w-96 px-4 mx-auto py-8">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-8">Habits Tracker</h1>
  </div>

  {#each habits as habit}
    <div
      data-target={habit.id}
      class="mb-2 flex items-start gap-x-2 relative"
      draggable="true"
      on:dragend={onDragend}
      on:dragover={onDragover}
      on:dragleave={onDragleave}
    >
      <div class="cursor-pointer opacity-60 font-bold">:&nbsp;:</div>
      <span
        class="w-5 h-5 rounded mt-1 p-1 mr-1 cursor-pointer {habitHistories.find(
          (val) => val.id === habit.id && val.completedAt === dateNow
        )
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
        class="block w-full overflow-hidden textarea-resize min-h-fit text-lg resize-none focus:outline-none {habitHistories.find(
          (val) => val.id === habit.id && val.completedAt === dateNow
        )
          ? `line-through opacity-50`
          : ``}"
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
      {#each habitHistoryByMonth as yearMonth}
        <span
          id="month-{yearMonth}"
          data-year-month={yearMonth}
          on:click={changeMonth}
          class="py-1 px-4 rounded-full mr-2 cursor-pointer whitespace-nowrap hover:bg-amber-500 month-pills {selectedMonth ===
          yearMonth
            ? `bg-amber-500`
            : `bg-gray-500`}"
        >
          {labelPills(yearMonth)}
        </span>
      {/each}
    </div>
    <div class="overflow-x-auto mb-5">
      <div class="flex items-end mb-3" style="height: 120px;">
        {#each habitStats as stat, index}
          <button
            id="stat-{stat.id}"
            type="button"
            class="text-center mr-3 relative cursor-pointer hover:opacity-80"
            on:click={() => (habitDetail = stat.habits.map((val) => val.name))}
          >
            <div
              class="w-10 bg-amber-500"
              style="height: {stat.total * 10}px;"
            />
            <div class="font-bold bg-amber-700 font-mono">{stat.date}</div>
          </button>
        {/each}
      </div>
    </div>
    {#if habitDetail.length}
      <div class="bg-black w-full py-2 px-4 rounded text-left bg-opacity-50">
        {#each habitDetail as habit}
          {habit}<br />
        {/each}
      </div>
    {/if}
  </div>
</main>

<style>
  .placeholder-habit[contenteditable]:empty::before {
    content: "Add a habit";
    color: #9ca3af;
  }
</style>
