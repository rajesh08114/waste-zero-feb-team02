import { WASTE_SKILL_OPTIONS } from "../../constants/wasteSkills";

const WasteSkillSelect = ({
  label,
  value,
  onChange,
  error = "",
  options = WASTE_SKILL_OPTIONS,
  helperText = "Hold Ctrl (Windows) or Command (Mac) to select multiple skills.",
}) => {
  const selectedPreview = value.length > 0 ? value.join(", ") : "";

  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm font-semibold text-gray-700 dark:text-emerald-200">
          {label}
        </label>
      ) : null}
      <select
        value={value}
        onChange={(event) =>
          onChange(Array.from(event.target.selectedOptions, (item) => item.value))
        }
        multiple
        className="h-44 w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
      >
        {options.map((skill) => (
          <option key={skill} value={skill}>
            {skill}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 dark:text-emerald-400">{helperText}</p>
      {selectedPreview && (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          Selected: {selectedPreview}
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default WasteSkillSelect;
