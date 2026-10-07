import { Option, QuizQuestion } from '../types';

export interface RecallSpec {
  slot: number;
  eligibleSourceIndices: number[]; // 0 = Q1, 1 = Q2, 2 = Q3, 3 = Q4, etc.
}

export const QuestionSequencer = {
  /**
   * Resolves the exact recall specifications (target slots and source question indices)
   * based on class level and stage type:
   * - Class 4: Scout = 0; Warrior = 1 at 5/6 (Q1/Q2); Boss = 0
   * - Class 5: Scout = 50% 1 at 4/5 (Q1 or Q1/Q2); Warrior = 1 at 7/8/9 (Q1/Q2, Q2/Q3, Q2/Q3/Q4); Boss = 50% 1 at 4/5
   * - Class 6: Scout = 1 at 5/6 (Q1/Q2); Warrior = 1 at 8/9/10 (Q1/Q2, Q2/Q3, Q2/Q3/Q4); Boss = 0
   * - Class 7: Scout = 1 at 6/7 (Q1/Q2); Warrior = 50% 2 at 6/7 & 13/14 OR 50% 1 at 8/9; Boss = 0
   */
  resolveRecallSpecs(grade: string, stageType: string): RecallSpec[] {
    const cleanGrade = grade.replace(/\D/g, '');
    const type = stageType.toLowerCase();

    const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randomBool = (): boolean => Math.random() < 0.5;

    switch (cleanGrade) {
      case '4':
        if (type === 'warrior') {
          const slot = pickRandom([5, 6]);
          return [{ slot, eligibleSourceIndices: [0, 1] }]; // Q1 or Q2
        }
        return []; // Scout & Boss: 0 repeats

      case '5':
        if (type === 'scout' || type === 'boss') {
          if (randomBool()) {
            const slot = pickRandom([4, 5]);
            const sources = slot === 4 ? [0] : [0, 1]; // Slot 4: Q1 strictly; Slot 5: Q1 or Q2
            return [{ slot, eligibleSourceIndices: sources }];
          }
          return []; // 50% 0 repeats
        }
        if (type === 'warrior') {
          const slot = pickRandom([7, 8, 9]);
          let sources: number[];
          if (slot === 7) sources = [0, 1];
          else if (slot === 8) sources = [1, 2];
          else sources = [1, 2, 3];
          return [{ slot, eligibleSourceIndices: sources }];
        }
        return [];

      case '6':
        if (type === 'scout') {
          const slot = pickRandom([5, 6]);
          return [{ slot, eligibleSourceIndices: [0, 1] }];
        }
        if (type === 'warrior') {
          const slot = pickRandom([8, 9, 10]);
          let sources: number[];
          if (slot === 8) sources = [0, 1];
          else if (slot === 9) sources = [1, 2];
          else sources = [1, 2, 3];
          return [{ slot, eligibleSourceIndices: sources }];
        }
        return []; // Boss: 0 repeats

      case '7':
        if (type === 'scout') {
          const slot = pickRandom([6, 7]);
          return [{ slot, eligibleSourceIndices: [0, 1] }];
        }
        if (type === 'warrior') {
          const hasSecondRepeat = randomBool();
          if (hasSecondRepeat) {
            const slot1 = pickRandom([6, 7]);
            const slot2 = pickRandom([13, 14]);
            return [
              { slot: slot1, eligibleSourceIndices: [0, 1] },
              { slot: slot2, eligibleSourceIndices: [6, 7, 8] },
            ];
          } else {
            const slot = pickRandom([8, 9]);
            return [{ slot, eligibleSourceIndices: [1, 2, 3] }];
          }
        }
        return [];

      default:
        return [];
    }
  },

  /**
   * Generates the set of 1-based question numbers (slots) that should serve as spaced recall questions.
   */
  generateRecallSlots(targetCount: number, grade: string): Set<number> {
    if (targetCount <= 3) return new Set();

    const isJunior = grade.includes('4') || grade.includes('5');
    const slots = new Set<number>();
    const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randomBool = (): boolean => Math.random() < 0.5;

    if (isJunior) {
      switch (targetCount) {
        case 5:
          slots.add(pickRandom([4, 5]));
          break;
        case 10:
          slots.add(pickRandom([4, 5]));
          slots.add(pickRandom([9, 10]));
          break;
        case 15:
          slots.add(pickRandom([6, 7]));
          slots.add(pickRandom([13, 14]));
          break;
        case 20:
          slots.add(pickRandom([4, 5]));
          slots.add(pickRandom([9, 10]));
          slots.add(pickRandom([14, 15]));
          break;
        default: {
          let pos = 5;
          while (pos < targetCount) {
            slots.add(pos);
            pos += 5;
          }
          break;
        }
      }
    } else {
      switch (targetCount) {
        case 5:
          if (randomBool()) slots.add(pickRandom([4, 5]));
          break;
        case 10:
          slots.add(pickRandom([4, 5]));
          if (randomBool()) slots.add(pickRandom([8, 9, 10]));
          break;
        case 15:
          slots.add(pickRandom([6, 7]));
          slots.add(pickRandom([13, 14]));
          break;
        case 20:
          slots.add(pickRandom([4, 5]));
          slots.add(pickRandom([8, 9, 10]));
          if (Math.random() < 0.60) slots.add(pickRandom([13, 14, 15]));
          if (Math.random() < 0.35) slots.add(pickRandom([18, 19, 20]));
          break;
        default: {
          let pos = 5;
          while (pos < targetCount) {
            if (randomBool()) slots.add(pos);
            pos += 5;
          }
          break;
        }
      }
    }
    return slots;
  },

  /**
   * Clones a question for spaced recall, shuffling its options (A, B, C, D)
   * so students cannot exploit spatial button muscle-memory, and stamps a distinct recall ID.
   */
  prepareRecallQuestion(original: QuizQuestion, slotIndex: number): QuizQuestion {
    if (!original.options || original.options.length === 0) {
      return { ...original, id: `${original.id}_recall_${slotIndex}` };
    }

    // 1. Locate the correct option text (e.g. "48 cm²")
    const correctOptionText =
      original.options.find((opt) => opt.key === original.correctAnswer)?.text ||
      original.options[0].text;

    // 2. Shuffle option objects
    const shuffled = [...original.options].sort(() => Math.random() - 0.5);

    // 3. Remap keys cleanly to "A", "B", "C", "D"
    const remappedOptions: Option[] = shuffled.map((opt, idx) => ({
      key: String.fromCharCode(65 + idx), // 'A', 'B', 'C', 'D'
      text: opt.text,
    }));

    // 4. Find the new key where the correct text landed
    const newCorrectKey =
      remappedOptions.find((opt) => opt.text === correctOptionText)?.key || 'A';

    return {
      ...original,
      id: `${original.id}_recall_${slotIndex}`,
      options: remappedOptions,
      correctAnswer: newCorrectKey,
    };
  },

  /**
   * Builds an adaptive, grade-differentiated question sequence from a given pool.
   * Strictly enforces anti-adjacency: a question is NEVER repeated within 2 slots (gap >= 2).
   */
  buildAdaptiveSequence(
    pool: QuizQuestion[],
    targetCount: number,
    grade: string
  ): QuizQuestion[] {
    if (!pool || pool.length === 0 || targetCount <= 0) return [];

    if (pool.length < 3) {
      if (targetCount <= pool.length) return pool.slice(0, targetCount);
      const fallback: QuizQuestion[] = [...pool];
      let padIndex = 1;
      while (fallback.length < targetCount) {
        const base = pool[fallback.length % pool.length];
        fallback.push({ ...base, id: `${base.id}_pad_${padIndex++}` });
      }
      return fallback;
    }

    const recallSlots = this.generateRecallSlots(targetCount, grade);
    const availableUnique = [...pool].sort(() => Math.random() - 0.5);
    const result: QuizQuestion[] = [];
    const uniqueHistory: QuizQuestion[] = [];

    for (let slot = 1; slot <= targetCount; slot++) {
      const isRecallSlot = recallSlots.has(slot);

      let eligibleForRecall: QuizQuestion[] = [];
      if (isRecallSlot && uniqueHistory.length >= 1) {
        if (uniqueHistory.length >= 3) {
          eligibleForRecall = uniqueHistory.slice(0, uniqueHistory.length - 2);
        } else if (uniqueHistory.length === 2) {
          eligibleForRecall = [uniqueHistory[0]];
        }
      }

      if (isRecallSlot && eligibleForRecall.length > 0) {
        const candidate = eligibleForRecall[Math.floor(Math.random() * eligibleForRecall.length)];
        const recallQ = this.prepareRecallQuestion(candidate, slot);
        result.push(recallQ);
      } else {
        let nextNew: QuizQuestion;
        if (availableUnique.length > 0) {
          nextNew = availableUnique.shift()!;
        } else {
          const safeCandidates =
            pool.length > 2
              ? pool.filter((q) => {
                  const lastTwoIds = result.slice(-2).map((r) => r.id.split('_recall')[0]);
                  return !lastTwoIds.includes(q.id);
                })
              : pool;

          const baseList = safeCandidates.length > 0 ? safeCandidates : pool;
          const base = baseList[Math.floor(Math.random() * baseList.length)];
          nextNew = { ...base, id: `${base.id}_ext_${slot}` };
        }

        result.push(nextNew);
        uniqueHistory.push(nextNew);
      }
    }

    return result;
  },

  /**
   * Builds the complete stage sequence enforcing the exact grade & stage recall rules:
   * - Slots and source question targets are resolved via resolveRecallSpecs
   * - Anti-muscle memory shuffling with prepareRecallQuestion
   */
  buildStageSequence(
    pool: QuizQuestion[],
    targetCount: number,
    grade: string,
    stageType: string
  ): QuizQuestion[] {
    if (!pool || pool.length === 0 || targetCount <= 0) return [];

    if (pool.length < 3) {
      if (targetCount <= pool.length) return pool.slice(0, targetCount);
      const fallback: QuizQuestion[] = [...pool];
      let padIndex = 1;
      while (fallback.length < targetCount) {
        const base = pool[fallback.length % pool.length];
        fallback.push({ ...base, id: `${base.id}_pad_${padIndex++}` });
      }
      return fallback;
    }

    const specs = this.resolveRecallSpecs(grade, stageType);
    const specMap = new Map<number, RecallSpec>();
    specs.forEach((s) => specMap.set(s.slot, s));

    const availableUnique = [...pool].sort(() => Math.random() - 0.5);
    const result: QuizQuestion[] = [];
    const uniqueHistory: QuizQuestion[] = [];

    for (let slot = 1; slot <= targetCount; slot++) {
      const recallSpec = specMap.get(slot);

      if (recallSpec && uniqueHistory.length > 0) {
        const validIndices = recallSpec.eligibleSourceIndices.filter((idx) => idx < uniqueHistory.length);
        const targetCandidate =
          validIndices.length > 0
            ? uniqueHistory[validIndices[Math.floor(Math.random() * validIndices.length)]]
            : uniqueHistory.slice(0, -2)[0] || uniqueHistory[0];

        const recallQ = this.prepareRecallQuestion(targetCandidate, slot);
        result.push(recallQ);
      } else {
        let nextNew: QuizQuestion;
        if (availableUnique.length > 0) {
          nextNew = availableUnique.shift()!;
        } else {
          const safeCandidates =
            pool.length > 2
              ? pool.filter((q) => {
                  const lastTwoIds = result.slice(-2).map((r) => r.id.split('_recall')[0]);
                  return !lastTwoIds.includes(q.id);
                })
              : pool;
          const baseList = safeCandidates.length > 0 ? safeCandidates : pool;
          const base = baseList[Math.floor(Math.random() * baseList.length)];
          nextNew = { ...base, id: `${base.id}_ext_${slot}` };
        }

        result.push(nextNew);
        uniqueHistory.push(nextNew);
      }
    }

    return result;
  },
};
