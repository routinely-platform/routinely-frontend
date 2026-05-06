import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { postSignup } from '@/api/auth'
import { RoutinelyWordmark } from '@/components/common/Logo'
import AuthShell from '@/components/auth/AuthShell'
import AuthIntro from '@/components/auth/AuthIntro'
import PasswordField from '@/components/auth/PasswordField'
import {
  applyValidationFieldErrors,
  getApiErrorPayload,
  type ValidationFieldErrors,
} from '@/components/auth/authFormErrors'
import styles from '@/components/auth/authForm.module.css'

const schema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이어야 합니다.'),
  nickname: z
    .string()
    .min(1, '닉네임을 입력해주세요.')
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 8자 이상이어야 합니다.'),
})

type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    try {
      await postSignup(data)
      navigate('/login')
    } catch (err) {
      const apiError = getApiErrorPayload<ValidationFieldErrors>(err)

      if (!apiError) {
        setError('root', { message: '회원가입에 실패했습니다.' })
        return
      }

      const { errorCode } = apiError
      const message = apiError.message ?? '회원가입에 실패했습니다.'

      if (errorCode === 'VALIDATION_FAILED') {
        const fieldErrors = apiError.data ?? {}
        applyValidationFieldErrors(setError, fieldErrors)
        return
      }

      if (errorCode === 'EMAIL_ALREADY_EXISTS') {
        setError('email', { message })
        return
      }

      if (errorCode === 'NICKNAME_ALREADY_EXISTS') {
        setError('nickname', { message })
        return
      }

      setError('root', { message })
    }
  }

  return (
    <AuthShell variant="centered">
      <RoutinelyWordmark size={36} />

      <AuthIntro
        title="시작해볼까요?"
        description="Routinely에서 꾸준한 루틴을 만들어보세요."
        containerMarginTop={36}
        titleMarginTop={24}
        titleFontSize={44}
        titleLetterSpacing="-0.03em"
        descriptionMarginTop={8}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        style={{ marginTop: 28, gap: 14 }}
      >
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

        <div className={styles.field}>
          <input
            type="text"
            autoComplete="nickname"
            aria-label="닉네임"
            placeholder="닉네임 (2~20자)"
            {...register('nickname')}
            className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`}
          />
          {errors.nickname && <span className={styles.fieldError}>{errors.nickname.message}</span>}
        </div>

        <PasswordField
          autoComplete="new-password"
          aria-label="비밀번호"
          placeholder="비밀번호 (영문 8자 이상)"
          errorMessage={errors.password?.message}
          {...register('password')}
        />

        {errors.root && <div className={styles.rootError}>{errors.root.message}</div>}

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? '가입 중...' : '가입하기 →'}
        </button>

        <p className={styles.footer}>
          이미 계정이 있나요?{' '}
          <Link to="/login" className={styles.footerLink}>
            로그인
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
