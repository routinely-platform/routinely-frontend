import styles from './AuthShell.module.css'

interface AuthShellProps {
  variant: 'split' | 'centered'
  /** split 변형의 우측 패널. 셸은 배치만 하고 내용은 화면이 넣는다 */
  aside?: React.ReactNode
  children: React.ReactNode
}

export default function AuthShell({ variant, aside, children }: AuthShellProps) {
  if (variant === 'split') {
    return (
      <div className={styles.shell}>
        <main className={styles.formPane}>{children}</main>
        {aside}
      </div>
    )
  }

  return (
    <div className={styles.shellCentered}>
      <div className={styles.centeredInner}>{children}</div>
    </div>
  )
}
