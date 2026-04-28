import { Moon, Sun } from '@geist-ui/icons'

type Props = {
  appearance: 'light' | 'dark'
  setAppearance: (a: 'light' | 'dark') => void
}

/**
 * Geist Moon / Sun segmented toggle (toolbar-sized; scales with `iccp-theme-toggle` font-size).
 */
export function ThemeToggle({ appearance, setAppearance }: Props) {
  return (
    <div className="iccp-theme-toggle" role="group" aria-label="Color theme">
      <button
        type="button"
        className={`iccp-theme-toggle__seg ${appearance === 'dark' ? 'iccp-theme-toggle__seg--active' : ''}`}
        aria-pressed={appearance === 'dark'}
        aria-label="Dark theme"
        title="Dark"
        onClick={() => setAppearance('dark')}
      >
        <Moon size="1em" color="currentColor" aria-hidden />
      </button>
      <button
        type="button"
        className={`iccp-theme-toggle__seg ${appearance === 'light' ? 'iccp-theme-toggle__seg--active' : ''}`}
        aria-pressed={appearance === 'light'}
        aria-label="Light theme"
        title="Light"
        onClick={() => setAppearance('light')}
      >
        <Sun size="1em" color="currentColor" aria-hidden />
      </button>
    </div>
  )
}
