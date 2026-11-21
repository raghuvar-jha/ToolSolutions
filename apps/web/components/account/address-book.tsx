"use client";

import { useRouter } from "next/navigation";
import { CircleAlert, MapPin, Plus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { deleteAddress, saveAddress, setDefaultAddress } from "../../lib/account/actions";
import type { SavedAddress } from "../../lib/account/address-service";
import { AddressFields, EMPTY_ADDRESS, ADDRESS_FIELDS, type AddressValues } from "../checkout/address-form";
import type { AddressField } from "@repo/shared/checkout";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";
const PRIMARY = `inline-flex h-11 items-center justify-center rounded-pill bg-brand-950 px-6 text-[15px] font-semibold text-surface hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`;
const SECONDARY = `inline-flex h-11 items-center justify-center rounded-pill border border-brand-950 bg-surface px-6 text-[15px] font-semibold text-brand-950 hover:bg-brand-50 ${FOCUS}`;
const LINK = `rounded-sm text-sm text-brand-700 underline-offset-2 hover:underline disabled:opacity-60 ${FOCUS}`;

type Editing = { id: string | null; values: AddressValues; makeDefault: boolean } | null;

const toValues = (a: SavedAddress): AddressValues => ({
  fullName: a.fullName,
  mobile: a.mobile,
  email: "",
  line1: a.line1,
  line2: a.line2,
  city: a.city,
  state: a.state,
  pincode: a.pincode,
  instructions: a.instructions,
});

/** Saved addresses: list with Edit / Delete / Set default, and an add form (spec 014). */
export default function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(addresses.length === 0 ? { id: null, values: EMPTY_ADDRESS, makeDefault: true } : null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    await action().catch(() => null);
    setBusyId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {addresses.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-card border border-line bg-surface p-4 shadow-sm lg:p-5">
              <p className="flex items-center gap-2 font-semibold text-text">
                <MapPin aria-hidden className="size-4 text-brand-700" />
                {a.fullName}
                {a.isDefault && <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-xs font-normal text-brand-950">Default</span>}
              </p>
              <address className="mt-2 text-[15px] leading-relaxed text-body not-italic">
                {a.line1}
                {a.line2 && (
                  <>
                    <br />
                    {a.line2}
                  </>
                )}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.mobile}
              </address>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <button type="button" className={LINK} onClick={() => setEditing({ id: a.id, values: toValues(a), makeDefault: a.isDefault })}>
                  Edit<span className="sr-only"> address for {a.fullName}</span>
                </button>
                <button
                  type="button"
                  className={LINK}
                  disabled={busyId === a.id}
                  onClick={() => {
                    if (window.confirm("Delete this address? Past orders keep their own copy.")) {
                      void run(a.id, () => deleteAddress(a.id));
                    }
                  }}
                >
                  Delete<span className="sr-only"> address for {a.fullName}</span>
                </button>
                {!a.isDefault && (
                  <button type="button" className={LINK} disabled={busyId === a.id} onClick={() => void run(a.id, () => setDefaultAddress(a.id))}>
                    Set as default
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <AddressEditor
          key={editing.id ?? "new"}
          editing={editing}
          canCancel={addresses.length > 0}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button type="button" className={SECONDARY} onClick={() => setEditing({ id: null, values: EMPTY_ADDRESS, makeDefault: false })}>
          <Plus aria-hidden className="mr-1.5 size-4" />
          Add new address
        </button>
      )}
    </div>
  );
}

function AddressEditor({
  editing,
  canCancel,
  onDone,
  onCancel,
}: {
  editing: NonNullable<Editing>;
  canCancel: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(editing.values);
  const [makeDefault, setMakeDefault] = useState(editing.makeDefault);
  const [errors, setErrors] = useState<Partial<Record<AddressField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fields = useRef(new Map<AddressField, HTMLElement>());

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const { email: _email, ...address } = values;
    const result = await saveAddress(editing.id, address, makeDefault).catch(() => ({
      ok: false as const,
      fields: { form: "Could not save the address. Please try again." },
    }));
    setBusy(false);
    if (result.ok) {
      onDone();
      return;
    }
    const { form, ...rest } = result.fields as Partial<Record<AddressField | "form", string>>;
    setErrors(rest);
    setFormError(form ?? null);
    const first = ADDRESS_FIELDS.find((f) => rest[f]);
    if (first) fields.current.get(first)?.focus();
  };

  return (
    <form noValidate onSubmit={onSubmit} className="rounded-card border border-line bg-surface p-4 shadow-sm lg:p-6">
      <h2 className="mb-4 text-lg font-semibold text-text">{editing.id ? "Edit address" : "Add new address"}</h2>
      <AddressFields
        values={values}
        errors={errors}
        onChange={(name, value) => {
          setValues((v) => ({ ...v, [name]: value }));
          if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
        }}
        fieldRef={(name) => (el) => {
          if (el) fields.current.set(name, el);
          else fields.current.delete(name);
        }}
        hideEmail
      />
      <label className="mt-4 flex cursor-pointer items-center gap-2 text-[15px] text-text">
        <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="size-4 accent-brand-950" />
        Use as my default address
      </label>
      {formError && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-md border border-brand-950 bg-brand-50 px-3 py-2 text-sm text-text">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-950" />
          {formError}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={PRIMARY}>
          {busy ? "Saving…" : "Save address"}
        </button>
        {canCancel && (
          <button type="button" onClick={onCancel} className={SECONDARY}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
