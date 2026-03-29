import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import Checkbox from "./common/inputs/Checkbox";
import RangeInput from "./common/inputs/range-input/RangeInput";
import LotteryNumbersPicker from "./lottery-numbers-picker/LotteryNumbersPicker";
import Button from "./common/Button";
import { useCreateSession, useUpdateSpeed } from "../lib/api/sessions";

export default function LotterySimulationForm() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const createSession = useCreateSession();
  const updateSpeed = useUpdateSpeed();

  const form = useForm({
    defaultValues: {
      winningNumbers: Array(5).fill(null) as (number | null)[],
      yourNumbers: Array(5).fill(null) as (number | null)[],
      playWithRandomNumbers: false,
      speed: 500,
    },
    onSubmit: async ({ value }) => {
      const playerNumbers = value.yourNumbers.filter(
        (n): n is number => n !== null,
      );

      await createSession.mutateAsync(
        {
          useRandomNumbers: value.playWithRandomNumbers,
          playerNumbers: value.playWithRandomNumbers
            ? undefined
            : playerNumbers,
          speedMs: value.speed,
        },
        {
          onSuccess: (session) => setSessionId(session.id),
        },
      );
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
            onChangeCommitted={(speedMs) => {
              if (sessionId) {
                updateSpeed.mutate({ id: sessionId, speedMs });
              } else {
                form.handleSubmit();
              }
            }}
          />
        )}
      </form.Field>

      <Button className="mt-4" type="submit" disabled={createSession.isPending}>
        {createSession.isPending ? "Starting..." : "Start simulation"}
      </Button>
    </form>
  );
}
