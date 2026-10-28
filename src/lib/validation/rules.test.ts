import { describe, expect, it } from 'vitest';
import {
  emailSchema,
  genreIdsSchema,
  imageFileSchema,
  passwordSchema,
  ratingSchema,
  releaseYearSchema,
  toIsoDate,
  watchedAtSchema,
} from './rules';

const firstIssue = (result: {
  success: boolean;
  error?: { issues: { message: string }[] };
}) => result.error?.issues[0]?.message;

describe('When we validate form values like the API does', () => {
  it('should accept ratings from 1 to 10 in half steps', () => {
    expect(ratingSchema.safeParse(7.5).success).toBe(true);
    expect(firstIssue(ratingSchema.safeParse(7.3))).toBe(
      'Use meio ponto: 7, 7.5, 8…',
    );
    expect(firstIssue(ratingSchema.safeParse(10.5))).toBe(
      'A nota vai de 1 a 10',
    );
  });

  it('should accept release years from 1888 to next year', () => {
    const nextYear = new Date().getFullYear() + 1;

    expect(releaseYearSchema.safeParse(nextYear).success).toBe(true);
    expect(firstIssue(releaseYearSchema.safeParse(1887))).toBe(
      'O primeiro filme é de 1888',
    );
    expect(firstIssue(releaseYearSchema.safeParse(nextYear + 1))).toBe(
      'Ano muito no futuro',
    );
  });

  it('should refuse a watch date in the future', () => {
    expect(watchedAtSchema.safeParse(toIsoDate(new Date())).success).toBe(true);
    expect(firstIssue(watchedAtSchema.safeParse('2999-01-01'))).toBe(
      'A data não pode estar no futuro',
    );
    expect(firstIssue(watchedAtSchema.safeParse('01/02/2026'))).toBe(
      'Informe uma data válida',
    );
  });

  it('should accept from 1 to 5 genres', () => {
    expect(genreIdsSchema.safeParse(['a']).success).toBe(true);
    expect(genreIdsSchema.safeParse([]).success).toBe(false);
    expect(
      genreIdsSchema.safeParse(['a', 'b', 'c', 'd', 'e', 'f']).success,
    ).toBe(false);
  });

  it('should ask for a password with a letter and a number', () => {
    expect(passwordSchema.safeParse('filmes2026').success).toBe(true);
    expect(firstIssue(passwordSchema.safeParse('abcdefgh'))).toBe(
      'Use pelo menos um número',
    );
    expect(firstIssue(passwordSchema.safeParse('a1'))).toBe(
      'Use pelo menos 8 caracteres',
    );
  });

  it('should normalize the e-mail before checking it', () => {
    expect(emailSchema.parse(' Gabriel@Email.com ')).toBe('gabriel@email.com');
    expect(emailSchema.safeParse('gabriel@').success).toBe(false);
  });

  it('should accept JPEG, PNG or WebP images up to 5 MB', () => {
    const png = new File(['x'], 'a.png', { type: 'image/png' });
    const gif = new File(['x'], 'a.gif', { type: 'image/gif' });
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'a.jpg', {
      type: 'image/jpeg',
    });

    expect(imageFileSchema.safeParse(png).success).toBe(true);
    expect(firstIssue(imageFileSchema.safeParse(gif))).toBe(
      'Use uma imagem JPEG, PNG ou WebP',
    );
    expect(firstIssue(imageFileSchema.safeParse(big))).toBe(
      'A imagem pode ter até 5 MB',
    );
  });
});
