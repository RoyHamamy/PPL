/*
 * **********************************************
 * Printing result depth
 *
 * You can enlarge it, if needed.
 * **********************************************
 */
maximum_printing_depth(100).

:- current_prolog_flag(toplevel_print_options, A),
   (select(max_depth(_), A, B), ! ; A = B),
   maximum_printing_depth(MPD),
   set_prolog_flag(toplevel_print_options, [max_depth(MPD)|B]).

% Signature: unique(List, UniqueList, Dups)/3
% Purpose: succeeds if and only if UniqueList contains the same elements of List without duplicates (according to their order in List), and Dups contains the duplicates

member(X, [X|_]).
member(X, [_Y|Ys]) :- member(X, Ys). 

not_member(_X, []).
not_member(X , [Y|Ys]) :- X \= Y, not_member(X,Ys).

unique([],[],[]).
unique([X|L],Y,[X|Z]) :- unique(L,Y,Z), ((not_member(X,Z),member(X,Y));member(X,Z)).
unique([X|L],[X|Y],Z) :- unique(L,Y,Z), not_member(X,Y).