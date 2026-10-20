import { findBestMatch } from "@/utils/fuzzySearch";
import { MIN_MATCH_CONFIDENCE, resolveIsoDate } from "./shared";

export type BatchItemInput = {
  name: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  suggestedCategoryName?: string;
  suggestedAccountName?: string;
};

export type NamedOption = { id: string; name: string };

export type BatchItemRow = BatchItemInput & {
  categoryId: string;
  accountId: string;
  needsCategorySelection: boolean;
  needsAccountSelection: boolean;
};

export const categorySearchTerm = (item: BatchItemInput) =>
  item.suggestedCategoryName?.trim() || item.name?.trim() || item.description?.trim() || "";

/**
 * Pre-fills one row of the batch confirmation form.
 *
 * `categoryCandidates` are the user's categories closest to this item by embedding,
 * nearest first. A confident name match wins; otherwise the nearest candidate is
 * pre-selected and the row is flagged for review.
 */
export const resolveBatchRow = (
  item: BatchItemInput,
  categoryCandidates: NamedOption[],
  accounts: NamedOption[],
): BatchItemRow => {
  let categoryId = "";
  let needsCategorySelection = true;
  if (categoryCandidates.length > 0) {
    const match = findBestMatch(categoryCandidates, item.suggestedCategoryName, (c) => c.name);
    needsCategorySelection = match.confidence < MIN_MATCH_CONFIDENCE;
    categoryId = needsCategorySelection ? categoryCandidates[0].id : match.id;
  }

  // Without an account in the message the first one is a silent default, as in the
  // single-item form; only an account the user named but we could not find is flagged.
  let accountId = "";
  let needsAccountSelection = true;
  if (accounts.length > 0) {
    const match = findBestMatch(accounts, item.suggestedAccountName, (a) => a.name);
    const resolved = match.confidence >= MIN_MATCH_CONFIDENCE;
    accountId = resolved ? match.id : accounts[0].id;
    needsAccountSelection = !resolved && !!item.suggestedAccountName?.trim();
  }

  return {
    ...item,
    date: resolveIsoDate(item.date),
    categoryId,
    accountId,
    needsCategorySelection,
    needsAccountSelection,
  };
};
