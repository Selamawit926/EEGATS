import { z } from "zod";
import bcrypt from "bcrypt";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import shuffleSeed from 'shuffle-seed';
import { TRPCError } from "@trpc/server";

export const testTakerRouter = router({
  adminResetPassword: protectedProcedure.
    input(
      z.object({
        id: z.string(),
      })
    ).mutation(
      async ({ ctx, input }) => {
        if (ctx.session.role === 'admin') {
          const pwd = Math.random().toString(36).slice(-8);
          const hashed = await bcrypt.hash(pwd, 10)
          const data = await ctx.prisma.testTakers.update({
            where: {
              id: input.id,
            },
            data: {
              password: hashed,
              failedAttempts: 0,
            },
          });
          return pwd;
        } else {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'UNAUTHORIZED ACCESS.',
          })
        }

      }
    ),
  getTestTakersCount: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'admin') {

        return await ctx.prisma.testTakers.count({
          where: {
            username: {
              contains: input.search,
            },
          },
        });
      }
    }),

  getTestTakers: protectedProcedure
    .input(
      z.object({
        skip: z.number(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'admin') {
        return await ctx.prisma.testTakers.findMany({
          skip: input.skip,
          take: 6,
          orderBy: {
            createdAt: "desc",
          },
          where: {
            username: {
              contains: input.search,
              mode: 'insensitive'
            },
          },
          include: {
            examGroup: true,
          }
        });
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),



  getTestTakerId: publicProcedure
    .input(z.object({
      username: z.string()
    })).query(async ({ ctx, input }) => {
      const data = await ctx.prisma.testTakers.findUnique({
        where: {
          username: input.username,
        }
      });
      return data?.id;

    }),
  getExamsCount: protectedProcedure
    .input(z.object({
      testTakerId: z.string(),
      search: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const testTaker = await ctx.prisma.testTakers.findUnique({
          where: {
            id: input.testTakerId,
          }
        });
        const data = await ctx.prisma.exam.findMany({
          where: {
            name: {
              contains: input.search,
              mode: 'insensitive'
            },
            examGroup: {
              id: testTaker?.examGroupId
            },
            status: {
              not: 'generated'
            }
          },
          select: {
            _count: true
          },
        });
        return data.length;
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),
    // get Exam group name
    getExamGroupName: protectedProcedure
    .input(z.object({
      testTakerId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const testTaker = await ctx.prisma.testTakers.findUnique({
          where: {
            id: input.testTakerId,
          }
        });
        const data = await ctx.prisma.examGroup.findUnique({
          where: {
            id: testTaker?.examGroupId
          },
          select: {
            name: true
          },
        });
        return data;
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),
    
  getExams: protectedProcedure
    .input(
      z.object({
        skip: z.number(),
        search: z.string().optional(),
        testTakerId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const testTaker = await ctx.prisma.testTakers.findUnique({
          where: {
            id: input.testTakerId,
          }
        });
        const data = await ctx.prisma.exam.findMany({
          skip: input.skip,
          take: 6,
          orderBy: {
            createdAt: "desc",
          },
          where: {
            name: {
              contains: input.search,
              mode: 'insensitive'
            },
            examGroup: {
              id: testTaker?.examGroupId,

            },
            status: {
              not: 'generated'
            }
          },
          include: {
            TestSession: {
              where:
              {
                testTakerId: input.testTakerId,

              },


            },
            
          }

        });
        return data;
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),
  getExamDetails: protectedProcedure
    .input(z.object({
      examId: z.string(),
      testTakerId: z.string()
    })).query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const data = await ctx.prisma.exam.findUnique({
          where: {
            id: input.examId,
          },
          include: {
            TestSession: {
              where:
              {
                testTakerId: input.testTakerId,

              },
            },
          }
        }).then((data) => {
          if (data) {

            const currentDateTime = new Date();
            const globalTimeInSeconds: number = (data.duration * 60) - Math.floor((currentDateTime.valueOf() - data.testingDate.valueOf()) / 1000);

            const res = {
              ...data,
              globalTime: globalTimeInSeconds,
            };
            return res;

          }
          else {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Exam not found',

            });
          }
        });
        return data;
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),


  getExamQuestions: protectedProcedure
    .input(z.object({
      examId: z.string(),
      testTakerId: z.string(),
      currentIndex: z.number()
    })).query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const data = await ctx.prisma.questions.findMany({
          where: {
            examId: input.examId,
          },
          select: {
            id: true,
            title: true,
            image: true,
            choices: {
              select: {
                id: true,
                title: true,
                image: true,
              }
            },
            TestTakerResponse: {
              where: {
                testTakerId: input.testTakerId,
                examId: input.examId,
              },
              select: {
                choiceId: true,
              }
            }
          },
        }

        ).then((data) => {
          return data.map((item) => {
            return {
              ...item,
              choices: shuffleSeed.shuffle(item.choices, input.testTakerId),
              selectedAnswer: item.TestTakerResponse.length > 0 ? item.TestTakerResponse[0].choiceId : '',
              changed: false
            }
          })
        });
        const allQuestions = shuffleSeed.shuffle(data, input.testTakerId);
        return allQuestions[input.currentIndex];
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),

  getExamChecklist: protectedProcedure
    .input(z.object({
      examId: z.string(),
      testTakerId: z.string(),
    })).query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const data = await ctx.prisma.questions.findMany({
          where: {
            examId: input.examId,
          },
          select: {
            id: true,
            TestTakerResponse: {
              where: {
                testTakerId: input.testTakerId,
                examId: input.examId,
              },
              select: {
                choiceId: true,
              }
            }
          },
        }

        ).then((data) => {
          return data.map((item) => {
            return {
              ...item,
              selectedAnswer: item.TestTakerResponse.length > 0 ? item.TestTakerResponse[0].choiceId : '',
            }
          })
        });
        return shuffleSeed.shuffle(data, input.testTakerId);
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),

  createTestSession: protectedProcedure
    .input(z.object({
      examId: z.string(),
      testTakerId: z.string()
    })).mutation(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const exam = await ctx.prisma.exam.findUnique({
          where: {
            id: input.examId,
          }
        });
        if (exam) {
          if (Date.now() > exam?.testingDate.valueOf() && Date.now() < exam?.testingDate.valueOf() + exam?.duration * 60 * 1000) {
            const data = await ctx.prisma.testSession.create({
              data: {
                examId: input.examId,
                testTakerId: input.testTakerId,
              }
            });
            if (data) {
              return data;
            } else {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Error in creating test session',

              });
            }
          }
        } else {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Exam not found',

          });
        }

      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),
  getTestSession: protectedProcedure
    .input(z.object({
      examId: z.string(),
      testTakerId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const data = await ctx.prisma.testSession.findUnique({
          where: {
            testTakerId_examId: {
              testTakerId: input.testTakerId,
              examId: input.examId,
            }
          }
        });
        return data;
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),
  getQuestion: protectedProcedure
    .input(z.object({
      questionId: z.string(),
      testTakerId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const question = await ctx.prisma.questions.findUnique({
          where: {
            id: input.questionId,
          },
        });
        const choices = await ctx.prisma.choice.findMany({
          where: {
            questionId: input.questionId,
          }
        });

        return { 'question': question, 'choices': shuffleSeed.shuffle(choices, input.testTakerId) };

      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED ACCESS.',
        })
      }
    }),
  registerResponse: protectedProcedure
    .input(z.object({
      questionId: z.string(),
      testTakerId: z.string(),
      examId: z.string(),
      choiceId: z.string(),
      currentIndex: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        try {
          const correctAnswer = await ctx.prisma.questionAnswer.findUnique({
            where: {
              questionId: input.questionId,
            }
          });
          const data = await ctx.prisma.testTakerResponse.upsert({
            where: {
              testTakerId_examId_questionId: {
                questionId: input.questionId,
                testTakerId: input.testTakerId,
                examId: input.examId,
              },
            },
            update: {
              choiceId: input.choiceId,
              isCorrect: correctAnswer?.choiceId === input.choiceId ? true : false,
            },
            create: {

              choiceId: input.choiceId,
              testTakerId: input.testTakerId,
              examId: input.examId,
              questionId: input.questionId,
              isCorrect: correctAnswer?.choiceId === input.choiceId ? true : false,
            },
          }).then(async (data) => {
            await ctx.prisma.testSession.update({
              where: {
                testTakerId_examId: {
                  testTakerId: input.testTakerId,
                  examId: input.examId,
                }
              },
              data: {
                currentQuestion: input.currentIndex,
              }
            });
            return data;
          });
          if (data) {

            return true;
          } else {
            return false;
          }
        } catch (e) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error in registering response',

          });
        }
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED',
        });
      }
    }),
  submitExam: protectedProcedure
    .input(z.object({
      examId: z.string(),
      testTakerId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        const correctcount = await ctx.prisma.testTakers.findFirst({
          where: {
            id: input.testTakerId,
          },
          select: {
            _count: {
              select: {
                TestTakerResponse: {
                  where: {
                    isCorrect: true,
                    examId: input.examId,
                  }
                }
              },
            },
          },

        });

        const data = await ctx.prisma.testSession.update({
          where: {
            testTakerId_examId: {
              examId: input.examId,
              testTakerId: input.testTakerId,
            },
          },
          data: {
            isSubmitted: true,
            grade: correctcount?._count.TestTakerResponse,

          },
        })
        return data;
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED',

        });
      }
    }),
  getTotalScore: protectedProcedure
    .input(
      z.object({
        testTakerId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.role === 'testtaker' && ctx.session.uid === input.testTakerId) {
        try {
          let totalNumQuestions = 0;
          let totalScore = 0;
          const testTaker = await ctx.prisma.testTakers.findUnique({
            where: { id: input.testTakerId },
            include: { examGroup: true },
          });
      
          if (!testTaker || !testTaker.examGroup) {
            throw new Error("Test taker not found or not associated with an exam group.");
          }
      
          const exams = await ctx.prisma.exam.findMany({
            where: { examGroupId: testTaker.examGroup.id },
          });
      
          for (const exam of exams) {
            const testSession = await ctx.prisma.testSession.findUnique({
              where: { testTakerId_examId: { testTakerId : input.testTakerId, examId: exam.id } },
            });
      
            const grade = testSession ? testSession.grade : 0;
            const totalQuestions = exam.numberOfQuestions;
      
            totalNumQuestions +=totalQuestions;
            if(exam.status === 'gradeReleased'){

              totalScore +=grade;
            }
          }
          return { totalNumQuestions: totalNumQuestions, totalScore: totalScore };
        } catch (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'NOT_FOUND',
  
          });
        }
      
        
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED',

        });
      }
    }),

});
