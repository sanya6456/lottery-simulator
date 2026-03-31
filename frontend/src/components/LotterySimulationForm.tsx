import {
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useForm } from "@tanstack/react-form";
import Checkbox from "./common/inputs/Checkbox";
import RangeInput from "./common/inputs/range-input/RangeInput";
import LotteryNumbersPicker from "./lottery-numbers-picker/LotteryNumbersPicker";
import Button from "./common/Button";
import { useCreateSession, useUpdateSpeed } from "../lib/api/sessions";
import {
  useSessionSocket,
  type DrawResult,
} from "../lib/socket/useSessionSocket";
import Spacing from "./common/Spacing";
import { Typography } from "./common/Typography";
import { hasDuplicateIndicesInArray } from "../lib/utils/validators/restrict-duplications-in-array";
import { compact } from "lodash";

type TLotterySimulationFormProps = {
  latestDraw: DrawResult | null;
  setLatestDraw: Dispatch<SetStateAction<DrawResult | null>>;
};

export default function LotterySimulationForm({
  latestDraw,
  setLatestDraw,
}: TLotterySimulationFormProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const createSession = useCreateSession();
  const updateSpeed = useUpdateSpeed();

  const handleDraw = useCallback(
    (result: DrawResult) => {
      setLatestDraw(result);
    },
    [setLatestDraw],
  );

  const handleSessionEnded = () => setIsRunning(false);

  useSessionSocket(sessionId, {
    onDraw: handleDraw,
    onSessionEnded: handleSessionEnded,
  });

  const form = useForm({
    canSubmitWhenInvalid: true,
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
          onSuccess: (session) => {
            setSessionId(session.id);
            setIsRunning(true);
          },
        },
      );
    },
  });

  const handleLatestDrawChange = useEffectEvent(() => {
    if (!latestDraw) return;

    form.setFieldValue("winningNumbers", latestDraw.drawnNumbers);
    form.setFieldValue("yourNumbers", latestDraw.playerNumbers);
  });

  useEffect(() => {
    void handleLatestDrawChange();
  }, [latestDraw]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset>
        <Typography as="legend" className="sr-only">
          Lottery Simulation form
        </Typography>
        <div className="grid grid-cols-[max-content_1fr] gap-4 max-w-98.5 w-full lg:gap-6">
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

          <form.Field
            name="yourNumbers"
            validators={{
              onSubmit: ({ value }) => {
                if (form.getFieldValue("playWithRandomNumbers") === true)
                  return undefined;

                if (hasDuplicateIndicesInArray(value))
                  return "Numbers must be unique";

                if (compact(value).length !== 5)
                  return "Please enter 5 numbers";

                return undefined;
              },
            }}
          >
            {(field) => (
              <LotteryNumbersPicker
                label="Your numbers:"
                value={field.state.value}
                onChange={field.handleChange}
                readonly={createSession.isPending || isRunning}
                isValid={field.state.meta.isValid}
                errorMessage={field.state.meta.errors?.[0]}
              />
            )}
          </form.Field>
        </div>
        <Spacing size="md" />
        <div className="flex gap-4">
          <Typography
            htmlFor="playWithRandomNumbers"
            as="label"
            className="my-auto"
          >
            Play with random numbers:
          </Typography>
          <form.Field name="playWithRandomNumbers">
            {(field) => (
              <Checkbox
                id="playWithRandomNumbers"
                disabled={createSession.isPending || isRunning}
                checked={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>
        <Spacing size="md" />
        <Typography as="label" className="my-auto">
          Speed:
          <Spacing size="md" />
          <form.Field name="speed">
            {(field) => (
              <RangeInput
                min={10}
                max={1000}
                step={10}
                value={field.state.value}
                onChange={field.handleChange}
                onChangeCommitted={(speedMs) => {
                  if (sessionId && isRunning) {
                    updateSpeed.mutate({ id: sessionId, speedMs });
                  }
                }}
              />
            )}
          </form.Field>
        </Typography>
        <Spacing size="lg" />

        <Button className="mt-4" type="submit" disabled={isRunning}>
          {isRunning ? "Running..." : "Start simulation"}
        </Button>
      </fieldset>
    </form>
  );
}
