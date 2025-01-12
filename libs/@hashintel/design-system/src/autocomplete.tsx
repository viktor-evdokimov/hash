import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  Autocomplete as MUIAutocomplete,
  AutocompleteProps as MUIAutocompleteProps,
  InputProps,
  outlinedInputClasses,
  PaperProps,
  PopperProps,
} from "@mui/material";
import { Ref, useCallback, useMemo, useState } from "react";

import { AutocompleteDropdown } from "./autocomplete-dropdown";
import { FontAwesomeIcon } from "./fontawesome-icon";
import {
  addPopperPositionClassPopperModifier,
  popperPlacementInputNoBorder,
  popperPlacementInputNoRadius,
} from "./popper-placement-modifier";
import { TextField } from "./text-field";

type AutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> = Omit<
  MUIAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  "renderInput"
> & {
  inputHeight?: number | string;
  inputRef?: Ref<Element>;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputProps?: InputProps;
  autoFocus?: boolean;
  modifiers?: PopperProps["modifiers"];
  /**
   * joined indicates that the input is connected to another element, so we
   * change the visual appearance of the component to make it flow straight into
   * whatever element it's connected to
   */
  joined?: boolean;
};

const textFieldLabelHeight = 18;

export const Autocomplete = <
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined = false,
>({
  inputHeight = 57,
  open,
  sx,
  inputRef,
  inputPlaceholder,
  inputLabel,
  inputProps,
  autoFocus = true,
  modifiers,
  joined = true,
  options,
  componentsProps,
  ...rest
}: AutocompleteProps<
  Multiple extends true ? (T extends unknown[] ? T[number] : T) : T,
  Multiple,
  DisableClearable,
  FreeSolo
>) => {
  const allModifiers = useMemo(
    (): PopperProps["modifiers"] => [
      addPopperPositionClassPopperModifier,
      // We don't want the popup shifting position as that will break styles
      { name: "preventOverflow", enabled: false },
      ...(modifiers ?? []),
    ],
    [modifiers],
  );

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const popperOpenStyles = joined
    ? {
        ...popperPlacementInputNoRadius,
        ...popperPlacementInputNoBorder,
        boxShadow: "none",
      }
    : {};

  const paperComponent = useCallback(
    ({ children, ...props }: PaperProps) =>
      options.length ? (
        <AutocompleteDropdown
          {...props}
          joined={joined}
          inputHeight={inputHeight}
        >
          {children}
        </AutocompleteDropdown>
      ) : null,
    [joined, inputHeight, options],
  );

  return (
    <MUIAutocomplete
      noOptionsText="No options found..."
      open={open}
      options={options}
      sx={[{ width: "100%" }, ...(Array.isArray(sx) ? sx : [sx])]}
      /**
       * By default, the anchor element for an autocomplete dropdown is the
       * input base, but we some uses of this component depend on resizing the
       * autocomplete root in order to attach the popup in a slightly different
       * place, so we make the autocomplete root the anchor element for the
       * popup.
       *
       * @see LinkEntityTypeSelector
       */
      ref={setAnchorEl}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          inputRef={inputRef}
          placeholder={inputPlaceholder}
          label={inputLabel}
          sx={{ width: "100%" }}
          /**
           * Prevents backspace deleting chips when in multiple mode
           * @see https://github.com/mui/material-ui/issues/21129#issuecomment-636919142
           */
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              event.stopPropagation();
            }
          }}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment:
              inputProps && "endAdornment" in inputProps ? (
                inputProps.endAdornment
              ) : (
                <FontAwesomeIcon
                  icon={faSearch}
                  sx={{
                    fontSize: 14,
                    color: ({ palette }) => palette.gray[40],
                  }}
                />
              ),
            sx: [
              (theme) => ({
                // The popover needs to know how tall this is to draw
                // a shadow around it
                height:
                  typeof inputHeight === "number"
                    ? inputHeight + (inputLabel ? textFieldLabelHeight : 0)
                    : undefined,

                // Focus is handled by the options popover
                "&.Mui-focused": {
                  boxShadow: "none",
                  ...(open === undefined && options.length
                    ? popperOpenStyles
                    : {}),
                },

                [`.${outlinedInputClasses.notchedOutline}`]: {
                  border: `1px solid ${theme.palette.gray[30]} !important`,
                },
              }),
              open && options.length ? popperOpenStyles : {},
              ...(inputProps?.sx
                ? Array.isArray(inputProps.sx)
                  ? inputProps.sx
                  : [inputProps.sx]
                : []),
            ],
          }}
        />
      )}
      popupIcon={null}
      forcePopupIcon={false}
      selectOnFocus={false}
      openOnFocus
      clearOnBlur={false}
      PaperComponent={paperComponent}
      componentsProps={{
        ...componentsProps,
        popper: {
          ...(componentsProps?.popper ?? {}),
          modifiers: allModifiers,
          anchorEl,
        },
      }}
      {...rest}
    />
  );
};
