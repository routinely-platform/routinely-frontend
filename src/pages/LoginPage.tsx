import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { postLogin } from '@/api/auth'
import { RoutinelyWordmark } from '@/components/common/Logo'
import AuthShell from '@/components/auth/AuthShell'
import PasswordField from '@/components/auth/PasswordField'
import {
  applyValidationFieldErrors,
  getApiErrorPayload,
  type ValidationFieldErrors,
} from '@/components/auth/authFormErrors'
import styles from '@/components/auth/authForm.module.css'

const schema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이어야 합니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

type FormValues = z.infer<typeof schema>

const DEFAULT_SERVER_ERROR_MESSAGE =
  '일시적인 서버 문제로 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await postLogin(data)
      setAuth(result.accessToken, result.user)
      navigate('/', { replace: true })
    } catch (err) {
      const apiError = getApiErrorPayload<ValidationFieldErrors>(err)

      if (!apiError) {
        const message = err instanceof Error ? err.message : DEFAULT_SERVER_ERROR_MESSAGE
        setError('root', { message })
        return
      }

      const { errorCode, message } = apiError

      if (errorCode === 'VALIDATION_FAILED') {
        const fieldErrors = apiError.data ?? {}
        applyValidationFieldErrors(setError, fieldErrors)

        if (Object.keys(fieldErrors).length === 0) {
          setError('root', { message: message ?? '입력값을 다시 확인해주세요.' })
        }
        return
      }

      if (errorCode === 'INVALID_CREDENTIALS') {
        setError('root', {
          message: message ?? '이메일 또는 비밀번호가 올바르지 않습니다.',
        })
        return
      }

      if (message) {
        setError('root', { message })
        return
      }

      setError('root', { message: DEFAULT_SERVER_ERROR_MESSAGE })
    }
  }

  return (
    <AuthShell variant="split">
      <RoutinelyWordmark size={36} />

      <div style={{ marginTop: 60 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--coral-600)',
          }}
        >
          WELCOME BACK
        </div>
        <h1
          style={{
            fontSize: 52,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            fontWeight: 700,
            marginTop: 12,
          }}
        >
          오늘도
          <br />
          시작해볼까요?
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 14, fontSize: 15 }}>
          21일째 함께하는 친구들이 기다리고 있어요.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} style={{ marginTop: 36 }}>
        <div className={styles.field}>
          <input
            type="email"
            autoComplete="email"
            aria-label="이메일"
            placeholder="이메일"
            {...register('email')}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </div>

        <PasswordField
          autoComplete="current-password"
          aria-label="비밀번호"
          placeholder="비밀번호 (영문만)"
          errorMessage={errors.password?.message}
          {...register('password')}
        />

        {errors.root && <div className={styles.rootError}>{errors.root.message}</div>}

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? '로그인 중...' : '로그인 →'}
        </button>

        <p className={styles.footer}>
          처음이신가요?{' '}
          <Link to="/signup" className={styles.footerLink}>
            회원가입
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
