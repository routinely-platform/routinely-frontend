import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { postLogin } from '@/api/auth'
import { RoutinelyWordmark } from '@/components/common/Logo'
import AuthShell from '@/components/auth/AuthShell'
import AuthIntro from '@/components/auth/AuthIntro'
import LoginPreviewPanel from '@/components/auth/LoginPreviewPanel'
import PasswordField from '@/components/auth/PasswordField'
import {
  applyValidationFieldErrors,
  getApiErrorPayload,
  type ValidationFieldErrors,
} from '@/components/auth/authFormErrors'
import styles from '@/components/auth/authForm.module.css'
import pageStyles from './LoginPage.module.css'

const schema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이어야 합니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

type FormValues = z.infer<typeof schema>

// 실패 문구는 화면이 고정한다(screens.md §2). 서버 message를 쓰지 않는 이유 —
// "이메일이 없습니다"처럼 어느 쪽이 틀렸는지 갈라 쓰면 계정 존재 확인 수단이 되는데,
// 그 보장을 백엔드 문구에 맡기지 않는다.
const INVALID_CREDENTIALS_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.'
const VALIDATION_FALLBACK_MESSAGE = '입력값을 다시 확인해주세요.'
const DEFAULT_SERVER_ERROR_MESSAGE =
  '일시적인 서버 문제로 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await postLogin(data)
      setAuth(result.accessToken, result.user)
      navigate('/', { replace: true })
    } catch (err) {
      const apiError = getApiErrorPayload<ValidationFieldErrors>(err)

      if (apiError?.errorCode === 'VALIDATION_FAILED') {
        // 필드 아래 에러가 가리키는 값이므로 비우지 않는다
        const fieldErrors = apiError.data ?? {}
        applyValidationFieldErrors(setError, fieldErrors)

        if (Object.keys(fieldErrors).length === 0) {
          setError('root', { message: VALIDATION_FALLBACK_MESSAGE })
        }
        return
      }

      if (apiError?.errorCode === 'INVALID_CREDENTIALS') {
        // 틀린 값만 비운다. 이메일은 남긴다
        setValue('password', '')
        setError('root', { message: INVALID_CREDENTIALS_MESSAGE })
        return
      }

      // 네트워크·서버 오류는 입력이 틀린 게 아니므로 그대로 두고 다시 누르게 한다
      setError('root', { message: DEFAULT_SERVER_ERROR_MESSAGE })
    }
  }

  return (
    <AuthShell variant="split" aside={<LoginPreviewPanel />}>
      <RoutinelyWordmark size={32} />

      <div className={pageStyles.body}>
        <AuthIntro
          eyebrow="다시 만나서 반가워요"
          title="오늘의 루틴을 이어가 볼까요?"
          description="완벽하지 않아도 괜찮아요. 어제 하던 자리에서 다시 시작하면 됩니다."
          containerMarginTop={0}
          titleMarginTop={8}
          titleFontSize="clamp(32px, 3.6vw, 44px)"
          titleLetterSpacing="-0.035em"
          descriptionMarginTop={14}
        />

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} style={{ marginTop: 28 }}>
          <div className={styles.field}>
            <label htmlFor="login-email" className={styles.label}>
              이메일 주소
            </label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              {...register('email')}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </div>

          <PasswordField
            id="login-password"
            label="비밀번호"
            autoComplete="current-password"
            placeholder="영문만"
            errorMessage={errors.password?.message}
            {...register('password')}
          />

          {errors.root && (
            <div role="alert" className={styles.rootError}>
              {errors.root.message}
            </div>
          )}

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
      </div>

      <p className={pageStyles.foot}>작은 반복이 쌓이는 곳</p>
    </AuthShell>
  )
}
