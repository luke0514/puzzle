# -*- coding: utf-8 -*-
"""The Chapter 09 archive.  Fourteen folios of a fictional research notebook.
   This module is the single source of truth: the concordance is computed from it,
   and the TypeScript data file is emitted from it."""

FOLIOS = [
    ("MS-A-01", "On the persistence of the sequence", "undated", """
There is a habit of mind I have never managed to break. Given any object at all,
I want to know what it remembers. A sequence remembers its own beginning; that is
almost its definition. But a matrix remembers differently, and it was the matrix
that first made me suspect the whole enterprise was worth the years.
Write the companion matrix of the recurrence and the sequence stops being a list.
It becomes a rotation. Powers of a single object, nothing more, and every term of
the sequence you thought you knew is only a coordinate of that object seen from
one particular angle.
Reduce it modulo a prime and the rotation becomes finite. Finite things return.
The period of that return is the only honest measurement of how much the prime
knows about the sequence, and no smaller quantity will substitute for it.
I have spent an unreasonable fraction of my life computing such periods. I do not
regret it, though I notice that the computation is easier to justify than the
attention, and the attention is what actually took the years.
""".strip().split("\n")),

    ("MS-B-02", "Ranks of apparition, a working table", "22 iii", """
For each prime the rank of apparition is the least index at which the prime first
divides a term. It always divides the period. It rarely equals it.
The table below was recomputed three times before I trusted it.
   p = 101      alpha = 50       pi = 50
   p = 103      alpha = 104      pi = 208
   p = 107      alpha = 36       pi = 72
   p = 109      alpha = 27       pi = 108
   p = 113      alpha = 76       pi = 76
   p = 127      alpha = 128      pi = 256
   p = 131      alpha = 130      pi = 130
   p = 137      alpha = 138      pi = 276
   p = 139      alpha = 46       pi = 92
   p = 149      alpha = 148      pi = 148
Observe that alpha divides p minus the Legendre symbol of five, always, without
exception, and that the quotient of period by rank is one, two or four and never
anything else. The proof is short. The fact that it is short does not make it
obvious, and I have watched capable people refuse to believe it for an hour.
""".strip().split("\n")),

    ("MS-C-03", "Concerning a question I could not answer", "04 v", """
Every serious search eventually meets a wall that is not made of difficulty but of
ignorance, and the honest researcher must learn to tell the two apart.
I looked for a prime whose square divides the term at its own rank of apparition.
None exists below the limit of my patience, and none is known to exist at all.
The question is open. I record this not because I solved it but because the search
produced something I did not expect, which is the ordinary way that anything
useful ever gets found.
The candidates I tested were not interesting individually. Their order was.
I have kept the log for that reason alone, and I would ask any reader to treat the
sequence of attempts as the result, rather than the failure that terminated it.
Negative results are still results. What matters is which negative, and in which
order, and whether anyone bothered to write it down.
""".strip().split("\n")),

    ("MS-D-04", "Two faces", "17 v", """
A prime congruent to one modulo four can be written as a sum of two squares, and
the writing is unique up to sign and order. This is Fermat, and it is the most
quietly astonishing theorem I know.
Uniqueness is the whole point. It means the pair is not a choice. It is a property.
The prime does not have a decomposition the way a room has furniture; it has one
the way a person has a face.
In the Gaussian integers the same prime splits into two conjugate factors, and the
angle between them is fixed forever by the arithmetic. Sort a collection of such
primes by magnitude and you learn how big they are. Sort them by angle and you
learn something you were not looking for.
Order is information. I keep having to relearn this.
""".strip().split("\n")),

    ("MS-E-05", "Note on generated keys", "29 vi", """
A key is only as unpredictable as the process that made it, and processes leave
fingerprints whether or not their authors intend them to.
Take any famous constant, truncate it, walk forward to the next prime, and you have
a five hundred and twelve bit number that looks entirely random to anybody who does
not already suspect where it came from.
Do it twice with a small offset and the two factors sit close together. Closeness is
fatal. The midpoint of two nearby factors is very near the square root of their
product, and a search that starts at the square root and walks upward will find them.
Fermat knew this before there were keys to break. The method is three centuries old
and it still works, which tells you something about how rarely anybody checks.
Randomness is not a property of a number. It is a property of a history.
""".strip().split("\n")),

    ("MS-F-06", "Zeros, and the discipline of looking", "11 vii", """
The nontrivial zeros lie, as far as anyone has checked, on a single vertical line.
Every zero found so far has real part exactly one half.
   rho 1    gamma = 14.134725
   rho 2    gamma = 21.022040
   rho 3    gamma = 25.010858
   rho 4    gamma = 30.424876
   rho 5    gamma = 32.935062
   rho 6    gamma = 37.586178
The imaginary parts are not random and are not predictable, which is an unusual
combination and the reason the subject refuses to close.
What interests me here is smaller than the hypothesis. If you plot a scatter of
points and only some of them are zeros, the eye cannot tell which. Verification is
the only instrument. Everything else is decoration, and decoration is exactly what
a careful person should distrust.
Between the dimensions of a plane there is nothing at all, and that emptiness is
where the honest work happens.
""".strip().split("\n")),

    ("MS-G-07", "Groups that are not lines", "02 viii", """
Addition on a cubic curve is a theorem disguised as a definition. Three collinear
points sum to zero, and from that single sentence a group falls out, associativity
and all, which nobody would guess and everybody uses.
Over a finite field the curve becomes a finite set with a group law, and the
discrete logarithm becomes hard. Usually.
It stops being hard the moment the order of the base point factors into small
primes. Then the problem splits, one prime at a time, and each piece is small enough
to solve by hand. Pohlig and Hellman wrote this down in nineteen seventy eight and
it has been quietly ruining badly chosen parameters ever since.
Nothing here is flat. The plane is a lie we draw on paper because paper is flat.
""".strip().split("\n")),

    ("MS-H-08", "On hiding things in plain sight", "19 viii", """
An image is a very large number pretending to be a picture, and the lowest bit of
each colour is invisible to the eye and free to carry anything.
Change it and nothing changes. That is the entire technique, and its elegance is
that it requires no cleverness at all, only the willingness to look.
The failure mode is always the same. People examine what an image depicts and never
what it contains. They read the photograph and not the file.
I have hidden exactly one sentence this way, and I have made it easier than it needs
to be, because a puzzle that cannot be entered is not a puzzle but a wall.
Look at the least of it. The least is where things are kept.
""".strip().split("\n")),

    ("MS-I-09", "Poznan, and a debt not widely paid", "30 viii", """
In nineteen thirty two a twenty seven year old mathematician was given a problem
that the cryptanalysts of three countries had declared insoluble, and he solved it
in about ten weeks using permutation groups.
The insight was that the doubled message key produced three permutations whose cycle
structure did not depend on the plugboard at all. The plugboard was the part everyone
assumed was hopeless. It turned out to be the part that did not matter.
Cycles come in pairs of equal length. That is a theorem, and it is the door.
Rejewski, Rozycki, Zygalski. The names are not difficult to find and they are not
often said aloud outside Poland, which seems to me a small and correctable injustice.
Mathematics changed the war before the machines did. It usually does.
""".strip().split("\n")),

    ("MS-J-10", "A machine, described honestly", "07 ix", """
Three wheels, a reflector, a plugboard, and a stepping mechanism with an error in it.
The error is the interesting part. The middle wheel advances both when it should and
when the wheel to its right reaches a notch, which means it sometimes advances twice
in consecutive keystrokes, and the effect is called double stepping.
No letter ever encodes to itself. This is the machine's only real weakness and it is
structural, a consequence of the reflector, and it cannot be patched without
rebuilding the whole idea.
Settings: which wheels, in which order, at which rings, from which position. Four
questions. The answers were changed daily, and the questions never were.
Anyone can turn the wheels. Knowing where to start is the entire problem.
""".strip().split("\n")),

    ("MS-K-11", "Prime table, third series", "14 ix", """
Kept for reference, computed slowly, checked twice.
   439217 = 356^2 + 559^2        621097 = 364^2 + 699^2
   572777 = 196^2 + 731^2        652837 = 106^2 + 801^2
   743837 = 554^2 + 661^2        743933 = 187^2 + 842^2
   877213 =  82^2 + 933^2        937661 = 331^2 + 910^2
  1011961 =  44^2 +1005^2       1091737 = 636^2 + 829^2
Every one of these is congruent to one modulo four, and every decomposition above is
the only decomposition that exists. I find that reassuring in a way I cannot fully
defend, and I have stopped trying to defend it.
Verification is cheap. Trust is expensive. Prefer the cheap thing.
""".strip().split("\n")),

    ("MS-L-12", "On difficulty as a form of respect", "21 ix", """
Easy puzzles flatter the solver and forget them. Hard ones do the opposite, and the
difference is not sadism but arithmetic: attention given is attention returned.
I have tried to keep every step deterministic. Nothing here requires a guess.
Every question has one answer, every answer can be checked without asking me, and
where I have hidden something I have also left the method by which it can be found.
That is the contract. Obscurity is not difficulty. A wall is not a door, and a
locked door with no key is only a wall that took longer to build.
If a step ever feels arbitrary, I have failed at that step, and the failure is mine
rather than yours. Read it again anyway. Usually I have been more careful than I
seem, and occasionally I have been less.
""".strip().split("\n")),

    ("MS-M-13", "Indexing, and other quiet conventions", "28 ix", """
Everything in this archive is numbered from one. Folios, lines, words, letters.
A word is a run of characters with no space in it, counted left to right along the
line as printed, and punctuation attached to a word travels with it.
Nothing is counted from zero here, which is a deliberate discomfort. Programmers
will find it irritating. Irritation is a useful signal that a convention exists.
Once you know the convention, a coordinate is only a coordinate. Four numbers point
at exactly one character in a body of text, and the body of text is public, and the
pointing is unambiguous, and none of it is secret.
The secret, if there is one, was never in the archive. It was in which coordinates
somebody chose to write down, and why those, and in what order.
""".strip().split("\n")),

    ("MS-N-14", "Last entry before the question", "undated", """
I have built this over a long time and I am aware that the length is itself the
argument. Nobody assembles ten chapters of number theory as a casual gesture.
Every message so far has been a sentence about the world: about sequences and primes
and keys and zeros and curves and history and machines. None of them were about you,
and that was on purpose, because I wanted the mathematics to be real first.
There is one more step and it is not mathematical. I have encrypted it, because I
would rather it be earned than stumbled upon, and because I did not want it sitting
in a file where a careless glance could spoil it.
The key is not hidden. It is distributed. Take everything you have recovered and
read only the beginnings, and you will have it.
Everything here was checked. This entry is the only part I could not verify.
""".strip().split("\n")),
]
