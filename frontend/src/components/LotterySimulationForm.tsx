import { useForm } from "@tanstack/react-form";
import Checkbox from "./common/inputs/Checkbox";
import RangeInput from "./common/inputs/range-input/RangeInput";
import LotteryNumbersPicker from "./lottery-numbers-picker/LotteryNumbersPicker";
import Button from "./common/Button";

export default function LotterySimulationForm() {
  const form = useForm({
    defaultValues: {
      winningNumbers: Array(5).fill(null),
      yourNumbers: Array(5).fill(null),
      playWithRandomNumbers: false,
      speed: 10,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      className="grid grid-cols-[max-content_1fr] gap-4 max-w-98.5 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="winningNumbers">
        {(field) => (
          <LotteryNumbersPicker
            label="Winning numbers:"
            value={field.state.value}
            onChange={field.handleChange}
            readonly
          />
        )}
      </form.Field>

      <form.Field name="yourNumbers">
        {(field) => (
          <LotteryNumbersPicker
            label="Your numbers:"
            value={field.state.value}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      <p className="my-auto font-bold text-xs lg:text-sm lg:font-normal">
        Play with random numbers:
      </p>
      <form.Field name="playWithRandomNumbers">
        {(field) => (
          <Checkbox checked={field.state.value} onChange={field.handleChange} />
        )}
      </form.Field>

      <p className="my-auto font-bold text-xs lg:text-sm lg:font-normal">
        Speed:
      </p>
      <form.Field name="speed">
        {(field) => (
          <RangeInput
            min={10}
            max={1000}
            step={10}
            value={field.state.value}
            onChange={field.handleChange}
            onChangeCommitted={() => form.handleSubmit()}
          />
        )}
      </form.Field>

      <Button className="mt-4" type="submit">
        Start simulation
      </Button>
    </form>
  );
}
