total story
total request expertmatch


if (Auth::guard('web')->check()) {
                $today = Carbon::today();

                $totalCallRequest = DB::table('callrequest')
                    ->count();
                $totalCallCompleteRequest = DB::table('callrequest')
                    ->select(DB::raw('count(id) as total_count'), DB::raw('sum(totalMin) as total_time'))
                    ->where('callStatus', 'Completed')
                    ->first();


                $todayCallRequest = DB::table('callrequest')
                    ->whereDate('created_at', '=', $today)
                    ->count();

                $todayCallRequestReject = DB::table('callrequest')
                    ->whereDate('created_at', '=', $today)
                    ->where('callStatus', 'Rejected')
                    ->count();

                $todayCallRequestTime = DB::table('callrequest')
                    ->whereDate('created_at', '=', $today)
                    ->sum('totalMin');

                $totalChatRequest = DB::table('chatrequest')
                    ->count();

                $totalChatComplteRequest = DB::table('chatrequest')
                    ->select(DB::raw('count(id) as total_count'), DB::raw('sum(totalMin) as total_time'))
                    ->where('chatStatus', 'Completed')
                    ->first();

                $todayChatRequest = DB::table('chatrequest')
                    ->whereDate('created_at', '=', $today)
                    ->count();

                $todayChatRequestReject = DB::table('chatrequest')
                    ->where('chatStatus', 'Rejected')
                    ->whereDate('created_at', '=', $today)
                    ->count();

                $todayChatRequestTime = DB::table('chatrequest')
                    ->whereDate('created_at', '=', $today)
                    ->sum('totalMin');

                $totalReportRequest = DB::table('user_reports')
                    ->count();

                $totalCustomer = DB::table('users')
                    ->leftJoin('user_roles', 'user_roles.userId', '=', 'users.id')
                    ->where(function ($query) {
                        $query->where('user_roles.roleId', '=', 3)
                            ->orWhereNull('user_roles.roleId');
                    })
                    ->where('users.isActive', true)
                    ->where('users.isDelete', false)
                    ->count();

                $totalActiveCustomer = DB::table('users')
                    ->leftJoin('user_roles', 'user_roles.userId', '=', 'users.id')
                    ->Join('wallettransaction', 'wallettransaction.userId', '=', 'users.id')
                    ->where(function ($query) {
                        $query->where('user_roles.roleId', '=', 3)
                            ->orWhereNull('user_roles.roleId');
                    })
                    ->where('wallettransaction.transactionType',['Chat','Call'])
                    ->where('users.isActive', true)
                    ->where('users.isDelete', false)
                    ->count();
              
                $todayCustomer = DB::table('users')
                    ->leftJoin('user_roles', 'user_roles.userId', '=', 'users.id')
                    ->where(function ($query) {
                        $query->where('user_roles.roleId', '=', 3)
                            ->orWhereNull('user_roles.roleId');
                    })
                    ->where('users.isActive', true)
                    ->where('users.isDelete', false)
                    ->whereDate('users.created_at', '=', $today)
                    ->count();

                $totalAstrologer = DB::table('astrologers')
                    ->count();

                $totalOrders = DB::table('order_request')
                    ->where('orderType', '=', 'astromall')
                    ->count();

                $totalStories = DB::table('astrologer_stories')
                    ->count();

                $totalLiveAstro = DB::table('liveastro')
                    ->where('liveastro.isActive', '=', true)
                    ->orderBy('id', 'DESC')
                    ->count();
                $totalLiveChat =  DB::table('astrologers')->where('chatStatus', '=', 'Online')
                    ->count();
                $totalLiveCall =  DB::table('astrologers')->where('callStatus', '=', 'Online')
                    ->count();
                $totalRequest =  DB::table('astrologer_request')->where('status', '=', 'Pending')
                    ->count();
                $totalEarning = DB::table('admin_get_commissions')
                    ->sum('amount');

                $todayEarning = DB::table('admin_get_commissions')
                    ->whereDate('created_at', '=', $today)
                    ->sum('amount');

                $totalAstroEarning = DB::table('wallettransaction')
                    ->join('user_roles', 'user_roles.userId', '=', 'wallettransaction.userId')
                    ->where('user_roles.roleId', '=', '2')
                    ->sum('amount');

                $todayAstroEarning = DB::table('wallettransaction')
                    ->join('user_roles', 'user_roles.userId', '=', 'wallettransaction.userId')
                    ->where('user_roles.roleId', '=', '2')
                    ->whereDate('wallettransaction.created_at', '=', $today)
                    ->sum('amount');

                // $topAstrologers = DB::table('astrologers')
                //     ->where('isVerified', '=', true)
                //     ->orderBy('totalOrder', 'desc')
                //     ->limit(10)
                //     ->get();

                $totalwithdrawRequestAmount = DB::table('withdrawrequest')
                    ->where('status', '!=', 'Reject')
                    ->sum('withdrawAmount');

                $todaywithdrawRequestAmount = DB::table('withdrawrequest')
                    ->where('status', '!=', 'Reject')
                    ->whereDate('created_at', '=', $today)
                    ->sum('withdrawAmount');

                $totalDiposit = DB::table('payment')
                    ->select(DB::raw('SUM(amount) as total_amount'), 'paymentStatus')
                    ->groupBy('paymentStatus')
                    ->pluck('total_amount', 'paymentStatus');

                $todaytotalDiposit = DB::table('payment')
                    ->select(DB::raw('SUM(amount) as total_amount'), 'paymentStatus')
                    ->whereDate('created_at', '=', $today)
                    ->groupBy('paymentStatus')
                    ->pluck('total_amount', 'paymentStatus');


                $currentDate = Carbon::now();
                $last12Months = [];
                $last12Months[] = $currentDate->format('Y-m');
                for ($i = 1; $i <= 11; $i++) {
                    $lastMonth = $currentDate->subMonth();
                    $last12Months[] = $lastMonth->format('Y-m');
                }
                $last12Months = array_reverse($last12Months);
                $call = [];
                $chat = [];
                $report = [];
                $ti = [];
                for ($i = 0; $i < count($last12Months); $i++) {
                    $last12monthyear = array_map('intval', explode('-', $last12Months[$i]))[0];
                    $last12monthofmonth = array_map('intval', explode('-', $last12Months[$i]))[1];
                    $callRequest = DB::table('callrequest')
                        ->selectRaw('month(created_at) as callMonth')
                        ->selectRaw('count(id) as totalCall')
                        ->whereyear('created_at', '=', $last12monthyear)
                        ->wheremonth('created_at', '=', $last12monthofmonth)
                        ->groupBy(DB::raw(MONTHGROUP))
                        ->get();
                    $chatRequest = DB::table('chatrequest')
                        ->selectRaw('month(created_at) as chatMonth')
                        ->selectRaw('count(id) as totalChat')
                        ->whereyear('created_at', '=', $last12monthyear)
                        ->wheremonth('created_at', '=', $last12monthofmonth)
                        ->groupBy(DB::raw(MONTHGROUP))
                        ->get();
                    $reportRequest = DB::table('user_reports')
                        ->selectRaw('month(created_at) as month')
                        ->selectRaw('count(id) as totalReport')
                        ->whereyear('created_at', '=', $last12monthyear)
                        ->wheremonth('created_at', '=', $last12monthofmonth)
                        ->groupBy(DB::raw(MONTHGROUP))
                        ->get();
                    $monthyCommission = DB::table('admin_get_commissions')
                        ->selectRaw('month(created_at) as month')
                        ->selectRaw('sum(amount) as totalEarning')
                        ->whereyear('created_at', '=', $last12monthyear)
                        ->wheremonth('created_at', '=', $last12monthofmonth)
                        ->groupBy(DB::raw(MONTHGROUP))
                        ->get();
                    $dateObj = DateTime::createFromFormat('!m', $last12monthofmonth);
                    $data = array(
                        'callMonth' => $dateObj->format('M'),
                        'callYear' => $last12monthyear,
                        'totalCall' => $callRequest && count($callRequest) > 0 ? $callRequest[0]->totalCall : 0,
                    );
                    $chatData = array(
                        'chatMonth' => $dateObj->format('M'),
                        'chatYear' => $last12monthyear,
                        'totalChat' => $chatRequest && count($chatRequest) > 0 ? $chatRequest[0]->totalChat : 0,
                    );
                    $reportData = array(
                        'month' => $dateObj->format('M'),
                        'reportYear' => $last12monthyear,
                        'totalReport' => $reportRequest && count($reportRequest) > 0 ? $reportRequest[0]->totalReport : 0,
                    );
                    $monthCommission = array(
                        'month' => $dateObj->format('M'),
                        'commissionYear' => $last12monthyear,
                        'totalEarning' => $monthyCommission && count($monthyCommission) > 0 ? $monthyCommission[0]->totalEarning : 0,
                    );
                    array_push($call, $data);
                    array_push($chat, $chatData);
                    array_push($report, $reportData);
                    array_push($ti, $monthCommission);
                }
                $unverifiedAstrologer = DB::table('astrologers')
                    ->where('isVerified', '=', 'false')
                    ->get();
                foreach ($unverifiedAstrologer as $astrologers) {
                    $allSkill = array_map('intval', explode(',', $astrologers->allSkill));
                    $languages = array_map('intval', explode(',', $astrologers->languageKnown));
                    $allSkill = DB::table('skills')
                        ->whereIn('id', $allSkill)
                        ->select('name')
                        ->get();
                    $skill = $allSkill->pluck('name')->all();
                    $astrologers->allSkill = implode(",", $skill);
                    $languageKnown = DB::table('languages')
                        ->whereIn('id', $languages)
                        ->select('languageName')
                        ->get();
                    $languageKnown = $languageKnown->pluck('languageName')->all();
                    $astrologers->languageKnown = implode(",", $languageKnown);
                }
                $dashboardData = ([
                    "totalCallRequest" => $totalCallRequest,
                    "totalChatRequest" => $totalChatRequest,
                    "totalReportRequest" => $totalReportRequest,
                    // "topAstrologer" => $topAstrologers,
                    "totalEarning" => $totalEarning,
                    "totalCustomer" => $totalCustomer,
                    "totalAstrologer" => $totalAstrologer,
                    "monthlyCommission" => $ti,
                    "monthlyCallRequest" => $call,
                    "monthlyChatRequest" => $chat,
                    "monthlyReportRequest" => $report,
                    "unverifiedAstrologer" => $unverifiedAstrologer,
                    "totalOrders" => $totalOrders,
                    "totalStories" => $totalStories,
                    "totalLiveAstro" => $totalLiveAstro,
                    "totalAstroEarning" => $totalAstroEarning,
                    "totalLiveChat" => $totalLiveChat,
                    "totalLiveCall" => $totalLiveCall,
                    "totalRequest" => $totalRequest,
                    "totalwithdrawRequestAmount" => $totalwithdrawRequestAmount,
                    "todayCallRequest" => $todayCallRequest,
                    "todayCallRequestReject" => $todayCallRequestReject,
                    "todayCallRequestTime" => $todayCallRequestTime,
                    "todayChatRequest" => $todayChatRequest,
                    "todayChatRequestTime" => $todayChatRequestTime,
                    "todayChatRequestReject" => $todayChatRequestReject,
                    "totalReportRequest" => $totalReportRequest,
                    "todayCustomer" => $todayCustomer,
                    "todaywithdrawRequestAmount" => $todaywithdrawRequestAmount,
                    "todayAstroEarning" => $todayAstroEarning,
                    "todayEarning" => $todayEarning,
                    "totalDiposit" => $totalDiposit,
                    "todaytotalDiposit" => $todaytotalDiposit,
                    "totalCallCompleteRequest" => $totalCallCompleteRequest,
                    "totalChatComplteRequest" => $totalChatComplteRequest,
                    "totalActiveCustomer"=>$totalActiveCustomer
                ]);
                $labels = [];
                $data = [];
                $callData = [];
                $chatData = [];
                $reportData = [];
                $dashboardData = [$dashboardData];
                foreach ($dashboardData[0]['monthlyCommission'] as $label) {
                    $la = $label['month'] . ' ' . $label['commissionYear'];
                    array_push($labels, $la);
                    array_push($data, $label['totalEarning']);
                }

                foreach ($dashboardData[0]['monthlyCallRequest'] as $call) {
                    array_push($callData, $call['totalCall']);
                }
                foreach ($dashboardData[0]['monthlyChatRequest'] as $chat) {
                    array_push($chatData, $chat['totalChat']);
                }
                foreach ($dashboardData[0]['monthlyReportRequest'] as $report) {
                    array_push($reportData, $report['totalReport']);
                }
                $result = $dashboardData;
                return view('pages.dashboard-overview-1', compact('result', 'labels', 'data', 'callData', 'chatData', 'reportData'));
            } else {
                return redirect(loginUrl());
            }