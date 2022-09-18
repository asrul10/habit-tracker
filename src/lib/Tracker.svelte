<script>
  import { dateFormatter } from "../utils/dateFormatter";
  import cevronLeft from "../assets/chevron-left-solid.svg";
  import cevronRight from "../assets/chevron-right-solid.svg";

  export let history = [];

  let date = new Date();
  $: stats = habitStats(date, history);
  $: monthString = getStringMonth(date);
  $: yearString = getStringYear(date);

  const habitStats = (newDate, history) => {
    const days = Array(
      new Date(newDate.getFullYear(), newDate.getMonth(), 0).getDate()
    );
    const result = [];
    const today = dateFormatter(new Date());
    for (let day = 1; day <= days.length; day++) {
      const formatDate = dateFormatter(
        new Date(newDate.getFullYear(), newDate.getMonth(), day)
      );
      const isComplete = history.find((val) => val.completedAt === formatDate);
      if (isComplete) {
        result.push(1);
        continue;
      }
      if (today === formatDate) {
        result.push(2);
        continue;
      }
      result.push(0);
    }
    return result;
  };

  const getStringMonth = (newDate) => {
    return Intl.DateTimeFormat("en", { month: "long" }).format(newDate);
  };

  const getStringYear = (newDate) => {
    return Intl.DateTimeFormat("en", { year: "numeric" }).format(newDate);
  };

  const changeDate = (event) => {
    const { currentTarget } = event;
    const { action } = currentTarget.dataset;
    if (action === "next") {
      date.setMonth(date.getMonth() + 1);
    }
    if (action === "previous") {
      date.setMonth(date.getMonth() - 1);
    }
    date = date;
  };
</script>

<div class="mt-4 bg-zinc-700 p-3 rounded-md">
  <div class="flex">
    <button
      type="button"
      data-action="previous"
      on:click={changeDate}
      class="w-7 opacity-50 mr-2 cursor-pointer hover:bg-zinc-500 rounded shrink-0 grow-0 flex justify-center items-center"
    >
      <img src={cevronLeft} class="w-3" alt="previous" />
    </button>
    <div>
      <h3 class="opacity-60 text-sm mb-2 mx-[0.1rem]">
        {monthString}
        {yearString}
      </h3>
      {#each stats as stat}
        <div
          class:bg-zinc-400={stat === 0}
          class:bg-lime-400={stat === 1}
          class:bg-yellow-400={stat === 2}
          class="w-4 h-4 inline-block rounded opacity-60 text-sm mx-[0.1rem]"
        />
      {/each}
    </div>
    <button
      type="button"
      data-action="next"
      on:click={changeDate}
      class="w-7 opacity-50 ml-2 cursor-pointer hover:bg-zinc-500 focus-within:bg-zinc-700 rounded shrink-0 grow-0 flex justify-center items-center"
    >
      <img src={cevronRight} class="w-3" alt="next" />
    </button>
  </div>
</div>
